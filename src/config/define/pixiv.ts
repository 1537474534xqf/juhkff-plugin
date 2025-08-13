import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import lockfile from "proper-lockfile";
import { PIXIV_INIT_LOCK_PATH, PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash, saveConfigToFile } from "../common.js";
import { GroupSubscribeUser } from "../../types/config/define/pixiv.js";
import { createSubscribeTimer, firstSaveUserIllusts } from "../../utils/pixiv.js";
import { pixivSubscribeTimerDict } from "../../cache/global.js";
import { Pixiv as PixivVClient } from "@ibaraki-douji/pixivts";

export type Pixiv = {
    usePixiv: boolean,
    groupSubscribeToUserId: GroupSubscribeUser[],
    interval: number,
}

export let pixivInstance: PixivVClient | null = null;

export const pixivConfig: Pixiv = {} as Pixiv;

(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `pixiv.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `pixiv.yaml`);
    if (configFolderCheck(file, defaultFile)) logger.info(`- [JUHKFF-PLUGIN] 创建Pixiv配置`);

    let lastHash: string = getFileHash(fs.readFileSync(file, "utf8"));

    const sync = (() => {
        const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as Pixiv;
        const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8")) as Pixiv;
        configSync(userConfig, defaultConfig);
        fs.writeFileSync(file, YAML.stringify(userConfig));
        Object.assign(pixivConfig, userConfig);
        const func = async () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as Pixiv;
            Object.assign(pixivConfig, userConfig);
            // 插件初始化逻辑，插件启动不需要await，直接调用即可
            // pixiv 相关
            if (pixivConfig.usePixiv) {
                pixivInstance = new PixivVClient();
                // clearSubscribeTimer();
                initSubscribeTimer();
                removeUnusedSubscribeTimer();
            } else {
                removeAllSubscribeTimer();
            }
        }
        func();
        return func;
    })();

    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash) return;
        sync();
        lastHash = hash;
        logger.info(logger.grey(`- [JUHKFF-PLUGIN] 同步Pixiv配置`));
    }).on("error", (err) => { logger.error(`- [JUHKFF-PLUGIN] Pixiv配置同步异常`, err) })
})();


/* 修改配置的方法从文件内向外暴露 */
// 添加订阅用户ID
export function addSubscribe(userId: number, groupId: number) {
    const subscribeGroup = pixivConfig.groupSubscribeToUserId.find(user => user.userId === userId);
    if (!subscribeGroup) {
        pixivConfig.groupSubscribeToUserId.push({
            userId,
            groupIds: [groupId],
        });
    } else if (!subscribeGroup.groupIds.includes(groupId)) subscribeGroup.groupIds.push(groupId);
    // 写入配置文件
    saveConfigToFile(pixivConfig, "pixiv.yaml");
}

export function removeSubscribe(userId: number, groupId: number) {
    const subscribeGroup = pixivConfig.groupSubscribeToUserId.find(user => user.userId === userId);
    if (!subscribeGroup) return;
    const index = subscribeGroup.groupIds.indexOf(groupId);
    if (index !== -1) {
        subscribeGroup.groupIds.splice(index, 1);
        // 如果没有群组了，删除该用户订阅
        if (subscribeGroup.groupIds.length === 0) {
            pixivConfig.groupSubscribeToUserId = pixivConfig.groupSubscribeToUserId.filter(user => user.userId !== userId);
        }
        // 写入配置文件
        saveConfigToFile(pixivConfig, "pixiv.yaml");
    }
}

/**
 * 为方便配置刷新，只更新pixivSubscribeTimerDict中不存在的定时器
 */
async function initSubscribeTimer() {
    for (const item of pixivConfig.groupSubscribeToUserId) {
        if (pixivSubscribeTimerDict[item.userId]) continue;
        // 由于pixiv有反爬限制，不方便并行进行，用串行的方式排队请求比较稳妥
        await (async () => {
            while (true) {
                let release;
                try {
                    logger.info(`- [JUHKFF-PLUGIN] [Pixiv]获取订阅记录点中: 用户ID ${item.userId}`);
                    await firstSaveUserIllusts(item.userId.toString());
                    // 二次判断，如果在请求的间隔内取消了订阅，则不添加定时器
                    if (pixivConfig.groupSubscribeToUserId.find(user => user.userId === item.userId) === undefined) break;
                    // 为防止潜在并发，在这里设个锁
                    release = await lockfile.lock(PIXIV_INIT_LOCK_PATH, {
                        retries: {
                            retries: 100, // 限制重试次数避免无限等待
                            minTimeout: 100,
                            maxTimeout: 200,
                        },
                        stale: 15 * 1000, // 15秒后锁失效
                    });
                    const intervalId = await createSubscribeTimer(item.userId, pixivConfig.interval * 60 * 1000, pixivConfig);
                    pixivSubscribeTimerDict[item.userId] = intervalId;
                    logger.info(`- [JUHKFF-PLUGIN] [Pixiv]成功订阅: 用户ID ${item.userId}`);
                    break;
                } catch (error) {
                    if (error.code === "ETIMEDOUT") {
                        logger.warn(`- [JUHKFF-PLUGIN] [Pixiv]获取订阅记录点请求被重置，等待2min后自动重试（可忽视此条）`);
                        await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 2));
                        continue; // 重试
                    }
                    logger.error(`- [JUHKFF-PLUGIN] [Pixiv]订阅${item.userId}失败`, error);
                } finally {
                    if (release) {
                        try {
                            await release();
                        } catch (err) {
                            logger.warn(`[JUHKFF-PLUGIN] [Pixiv]释放文件锁时出错: ${err}`);
                        }
                    }
                }
            }
        })();
    }
}

/**
 * 删除取消的订阅定时器
 */
async function removeUnusedSubscribeTimer() {
    let release;
    try {
        // 订阅后立刻删除可能会导致取消订阅失败和订阅定时器放逐，所以这里要加个锁
        release = await lockfile.lock(PIXIV_INIT_LOCK_PATH, {
            retries: {
                retries: 100, // 限制重试次数避免无限等待
                minTimeout: 100,
                maxTimeout: 200,
            },
            stale: 15 * 1000, // 15秒后锁失效
        });
        for (const key of Object.keys(pixivSubscribeTimerDict)) {
            const userId = parseInt(key);
            const subscribeGroup = pixivConfig.groupSubscribeToUserId.find(user => user.userId === userId);
            if (!subscribeGroup) {
                clearInterval(pixivSubscribeTimerDict[key]);
                delete pixivSubscribeTimerDict[key];
                logger.info(`- [JUHKFF-PLUGIN] [Pixiv]清除订阅: 用户ID ${userId}`);
            }
        }
    } catch (error) {
        logger.error(`- [JUHKFF-PLUGIN] [Pixiv]清除订阅定时器失败`, error);
    }
    finally {
        if (release) {
            try {
                await release();
            } catch (err) {
                logger.warn(`[JUHKFF-PLUGIN] [Pixiv]释放文件锁时出错: ${err}`);
            }
        }
    }
}

function removeAllSubscribeTimer() {
    for (const key of Object.keys(pixivSubscribeTimerDict)) {
        clearInterval(pixivSubscribeTimerDict[key]);
        delete pixivSubscribeTimerDict[key];
    }
}