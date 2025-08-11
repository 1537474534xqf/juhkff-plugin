import { config } from "../config/index.js";
import { createSubscribeTimer, firstSaveUserIllusts } from "../utils/pixiv.js";

// 结果存到全局dict中
await (async () => {
    for (const item of config.pixiv.groupSubscribeToUserId) {
        for (const groupId of item.groupIds) {
            await firstSaveUserIllusts(item.userId.toString());
            await createSubscribeTimer(item.userId, groupId, item.useSpecialInterval ? item.interval : config.pixiv.defaultInterval);
        }
    }
})();

