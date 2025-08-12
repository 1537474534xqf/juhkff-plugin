import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash, saveConfigToFile } from "../common.js";
import { GroupSubscribeUser } from "../../types/config/define/pixiv.js";
import { createSubscribeTimer, firstSaveUserIllusts } from "../../utils/pixiv.js";
import { pixivSubscribeTimerDict } from "../../cache/global.js";
import { Pixiv as PixivVClient } from "@ibaraki-douji/pixivts";

export type Pixiv = {
    usePixiv: boolean,
    groupSubscribeToUserId: GroupSubscribeUser[],
    defaultInterval: number,
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
                pixivInstance.staticLogin("30242545_i5ypxGc6xzgtaXHvoz9okqkImuleufnA", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36");
            }
            // clearSubscribeTimer();
            initSubscribeTimer();
            removeUnusedSubscribeTimer();
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
export function addSubscribe(userId: number, groupId: number, interval: number = 30) {
    const subscribeGroup = pixivConfig.groupSubscribeToUserId.find(user => user.userId === userId);
    if (!subscribeGroup) {
        pixivConfig.groupSubscribeToUserId.push({
            userId,
            groupIds: [groupId],
            useSpecialInterval: false,
            interval,
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
        for (const groupId of item.groupIds) {
            if (pixivSubscribeTimerDict.has({ userId: item.userId, groupId })) continue;
            // 直接启动任务，不等待完成，所有任务并行执行
            (async () => {
                try {
                    logger.info(`- [JUHKFF-PLUGIN] [Pixiv]获取订阅记录点中: 用户ID ${item.userId} 群组ID ${groupId}`);
                    await firstSaveUserIllusts(item.userId.toString());
                    const intervalId = await createSubscribeTimer(item.userId, groupId, item.useSpecialInterval ? item.interval : pixivConfig.defaultInterval);
                    pixivSubscribeTimerDict.set({ userId: item.userId, groupId }, intervalId);
                    logger.info(`- [JUHKFF-PLUGIN] [Pixiv]成功订阅: 用户ID ${item.userId} 群组ID ${groupId}`);
                } catch (error) {
                    logger.error(`- [JUHKFF-PLUGIN] [Pixiv]订阅失败: 用户ID ${item.userId} 群组ID ${groupId}`, error);
                }
            })();
        }
    }
}

/**
 * 删除取消的订阅定时器
 */
async function removeUnusedSubscribeTimer() {
    for (const [key, value] of pixivSubscribeTimerDict) {
        const subscribeGroup = pixivConfig.groupSubscribeToUserId.find(user => user.userId === key.userId);
        if (!subscribeGroup || !subscribeGroup.groupIds.includes(key.groupId)) {
            clearInterval(value);
            pixivSubscribeTimerDict.delete(key);
            logger.info(`- [JUHKFF-PLUGIN] [Pixiv]清除订阅: 用户ID ${key.userId} 群组ID ${key.groupId}`);
        }
    }
}