import path from "path";
import fs from "fs";
import { PLUGIN_DATA_DIR } from "../model/path.js";
import { pixiv } from "../model/map.js";
import { pixivSubscribeDict } from "../cache/global.js";
import { Mutex } from "async-mutex";
export async function firstSaveUserIllusts(userId) {
    try {
        const response = await pixiv.client.getIllustsByUserID(userId, { limit: 0 });
        // 倒序排列
        let ids = response.map(illust => illust.illustID).reverse();
        if (ids.length === 0)
            ids = ["-1"];
        logger.info(`[JUHKFF-PLUGIN] 已订阅pixiv用户 ${userId} 的作品，最后得作品ID为：${ids[0]}`);
        const filePath = path.join(PLUGIN_DATA_DIR, "pixiv", `user_subscribe_${userId}.json`);
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }
        const lastId = ids[0];
        // 写入filePath，覆盖模式
        fs.writeFileSync(filePath, JSON.stringify({ "lastId": lastId }, null, 2));
        return true;
    }
    catch (error) {
        logger.error(`[JUHKFF-PLUGIN] 订阅用户 ${userId} 的作品失败：${error}`);
        return false;
    }
}
export async function createSubscribeTimer(userId, interval = 10) {
    const filePath = path.join(PLUGIN_DATA_DIR, "pixiv", `user_subscribe_${userId}.json`);
    if (!fs.existsSync(filePath)) {
        logger.error(`[JUHKFF-PLUGIN] 订阅文件不存在：${filePath}`);
        return;
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const lastId = data.lastId;
    const intervalConfig = { userId, lastIllustId: lastId };
    const lock = new Mutex();
    const intervalId = setInterval(checkAndFetchUserNewestIllustId, interval * 60 * 1000, lock, intervalConfig);
    pixivSubscribeDict[userId] = intervalId;
}
async function checkAndFetchUserNewestIllustId(lock, intervalConfig) {
    if (lock.isLocked())
        return;
    const release = await lock.acquire();
    try {
        const response = await pixiv.client.getIllustsByUserID(intervalConfig.userId, { limit: 0 });
        // id应该是和时间一样的排序吧
        let ids = response.map(illust => illust.illustID).reverse();
        if (ids.length === 0)
            ids = ["-1"];
        const lastId = ids[0];
        if (lastId === intervalConfig.lastIllustId) {
            logger.info(`[JUHKFF-PLUGIN] pixiv用户 ${intervalConfig.userId} 没有新作品，当前最新作品ID为：${lastId}`);
            return;
        }
        // 有更新
        const filePath = path.join(PLUGIN_DATA_DIR, "pixiv", `user_subscribe_${intervalConfig.userId}.json`);
        fs.writeFileSync(filePath, JSON.stringify({ "lastId": lastId }, null, 2));
        intervalConfig.lastIllustId = lastId;
        // TODO 机器人发送最新的作品
    }
    catch (e) {
        logger.error(e);
    }
    finally {
        release();
    }
}
//# sourceMappingURL=pixiv.js.map