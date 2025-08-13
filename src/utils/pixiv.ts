import path from "path";
import fs from "fs";
import { PLUGIN_DATA_DIR } from "../model/path.js";
import { Mutex } from "async-mutex";
import { Pixiv, pixivConfig, pixivInstance } from "../config/define/pixiv.js";
import { botId } from "../cache/global.js";
import axios from "axios";
import lockfile from "proper-lockfile";
import { randomInt } from "crypto";
import { HttpsProxyAgent } from "https-proxy-agent";

export async function firstSaveUserIllusts(userId: string, proxyAgent?: HttpsProxyAgent<string>) {
    while (true) {
        try {
            const response = await pixivInstance.getIllustsByUserID(userId, { httpAgent: proxyAgent, httpsAgent: proxyAgent }, 1);
            // 倒序排列
            let ids = response.map(illust => illust.illustID).reverse();
            if (ids.length === 0) ids = ["-1"];
            // logger.info(`[JUHKFF-PLUGIN] 已订阅pixiv用户 ${userId} 的插画，最后的插画作品ID为：${ids[0]}`);
            const filePath = path.join(PLUGIN_DATA_DIR, "pixiv", `user_subscribe_${userId}.json`);
            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }
            const lastId = ids[0];
            // 写入filePath，覆盖模式
            fs.writeFileSync(filePath, JSON.stringify({ "lastId": lastId }, null, 2));
            return true;
        } catch (error) {
            if (error.status == 429) {
                logger.warn(`[JUHKFF-PLUGIN] [Pixiv]请求频繁触发反爬虫保护，等待2min后自动重试（可忽视此条）`);
                await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 2)); // 等待1-3分钟间隔，防止请求过于集中
                continue;
            }
            if (error.code === "ECONNRESET") {
                logger.warn(`[JUHKFF-PLUGIN] [Pixiv]连接被重置，等待2min后自动重试（可忽视此条）`);
                await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 2));
                continue;
            }
            logger.error(`[JUHKFF-PLUGIN] [Pixiv]订阅用户 ${userId} 的作品失败：${error}`);
            return false;
        }
    }
}

export async function createSubscribeTimer(userId: number, pixivConfig: Pixiv, proxyAgent?: HttpsProxyAgent<string>) {
    const filePath = path.join(PLUGIN_DATA_DIR, "pixiv", `user_subscribe_${userId}.json`);
    if (!fs.existsSync(filePath)) {
        logger.error(`[JUHKFF-PLUGIN] [Pixiv]订阅配置文件不存在：${filePath}`);
        return;
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const lastIllustId = data.lastId as number;
    const intervalConfig = { userId: userId.toString(), lastIllustId, pixivConfig };
    const lock = new Mutex();
    const intervalId = setInterval(checkAndFetchUserNewestIllustId, pixivConfig.interval * 60 * 1000, lock, intervalConfig, proxyAgent);
    return intervalId;
}


async function checkAndFetchUserNewestIllustId(lock: Mutex, intervalConfig: { userId: string, lastIllustId: number, pixivConfig: Pixiv }, proxyAgent?: HttpsProxyAgent<string>) {
    if (lock.isLocked()) return;
    const release = await lock.acquire();
    while (true) {
        try {
            const response = await pixivInstance.getIllustsByUserID(intervalConfig.userId, { httpAgent: proxyAgent, httpsAgent: proxyAgent }, 1);
            // id应该是和时间一样的排序吧
            let ids = response.map(illust => illust.illustID).reverse();
            if (ids.length === 0) ids = ["-1"];
            const lastId = ids[0];
            if (lastId === intervalConfig.lastIllustId) return;
            // 有更新
            logger.info(`[JUHKFF-PLUGIN] [Pixiv]用户 ${intervalConfig.userId} 发布新插画，ID为：${lastId}`);
            const filePath = path.join(PLUGIN_DATA_DIR, "pixiv", `user_subscribe_${intervalConfig.userId}.json`);
            // 机器人发送最新的作品，暂时只取第一张
            const newestImageNumber = response[response.length - 1].urls.length;
            const imageTitle = response[response.length - 1].title;
            const userName = response[response.length - 1].user.name;
            const originalImageUrl = response[response.length - 1].urls[0].regular;
            const imagePath = await downloadPixivImage(lastId, originalImageUrl);
            const groupIds = pixivConfig.groupSubscribeToUserId.find(item => item.userId === parseInt(intervalConfig.userId))?.groupIds || [];
            for (const groupId of groupIds)
                await Bot.sendGroupMsg(botId, groupId, [segment.image(imagePath), newestImageNumber > 1 ? `（${newestImageNumber - 1}张图片被隐藏）` : '', `${userName}发布了新动态：`, imageTitle]);
            // 只有在下载和发送都成功后才更新lastId
            fs.writeFileSync(filePath, JSON.stringify({ "lastId": lastId }, null, 2));
            intervalConfig.lastIllustId = lastId;
            return;
        } catch (error) {
            if (error.status == 429) {
                logger.warn(`[JUHKFF-PLUGIN] [Pixiv]请求频繁触发反爬虫保护，等待2min后自动重试（可忽视此条）`);
                await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 2)); // 等待1-3分钟间隔，防止请求过于集中
                continue;
            }
            if (error.code === 'ECONNRESET') {
                logger.warn(`[JUHKFF-PLUGIN] [Pixiv]连接被重置，等待2min后自动重试（可忽视此条）`);
                await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 2));
                continue;
            }
            logger.error(error);
            return;
        } finally {
            release();
        }
    }
}


export async function downloadPixivImage(illustId: string, imageUrl: string): Promise<string> {
    const suffix = imageUrl.split(".").pop();
    const filePath = path.join(PLUGIN_DATA_DIR, "pixiv", "images", `${illustId}.${suffix}`);
    const tempFilePath = `${filePath}.temp`;
    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    if (!fs.existsSync(filePath)) fs.closeSync(fs.openSync(filePath, 'w')); // 创建空文件占位
    let release;
    try {
        // 获取文件锁
        release = await lockfile.lock(filePath, {
            retries: {
                retries: 100, // 限制重试次数避免无限等待
                minTimeout: 1000,
                maxTimeout: 2000,
            },
            stale: 10 * 60 * 1000, // 10 分钟后锁失效
        });

        if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) return filePath;

        while (true) {
            const result = await new Promise<boolean>((resolve, reject) => {
                axios({
                    method: 'GET',
                    url: imageUrl,
                    responseType: 'stream',
                    headers: { Referer: 'https://www.pixiv.net/' }
                }).then(response => {
                    const fileStream = fs.createWriteStream(tempFilePath);
                    response.data.pipe(fileStream);
                    fileStream.on('finish', () => {
                        fileStream.close();
                        // 下载完成后原子性地重命名文件
                        fs.renameSync(tempFilePath, filePath);
                        resolve(true);
                    });
                }).catch(async err => {
                    if (err.response?.status === 429) {
                        logger.warn(`[JUHKFF-PLUGIN] [Pixiv]下载请求触发反爬虫保护，等待一段时间后自动重试（可忽视此条）`);
                        await new Promise(resolve => setTimeout(resolve, 1000 * 60 + randomInt(0, 20) * 1000));
                        resolve(false);
                    } else {
                        logger.error(`[JUHKFF-PLUGIN] [Pixiv]下载Pixiv订阅图片失败: ${err}`);
                        // 清理临时文件
                        if (fs.existsSync(tempFilePath)) {
                            fs.unlinkSync(tempFilePath);
                        }
                        reject(err);
                    }
                });
            });
            if (result) return filePath;
        }
    } finally {
        // 释放文件锁
        if (release) {
            try {
                await release();
            } catch (err) {
                logger.warn(`[JUHKFF-PLUGIN] [Pixiv]释放文件锁时出错: ${err}`);
            }
        }
    }
}