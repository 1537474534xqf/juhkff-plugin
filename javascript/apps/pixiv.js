import { pixivSubscribeTimerDict } from "../cache/global.js";
import { addSubscribe, removeSubscribe } from "../config/define/pixiv.js";
import { config } from "../config/index.js";
import { createSubscribeTimer, firstSaveUserIllusts } from "../utils/pixiv.js";
export class pixiv extends plugin {
    constructor() {
        super({
            name: "[扎克芙芙]pixiv插件",
            dsc: "pixiv相关功能",
            event: "message",
            priority: 9999, // 优先级，越小越先执行
            rule: [
                {
                    reg: "^#pixiv订阅",
                    fnc: "subscribe",
                },
            ],
        });
    }
    async subscribe(e) {
        let userId;
        try {
            userId = e.msg.match(/#pixiv订阅 (\d+)/)[1];
        }
        catch (error) {
            return e.reply("请输入正确的pixiv订阅指令");
        }
        const result = await firstSaveUserIllusts(userId);
        // 获取最新的插画ID
        if (!result)
            return await e.reply(`订阅pixiv用户 ${userId} 的插画失败，请检查日志。`);
        // 更新config
        addSubscribe(parseInt(userId), e.group_id);
        // 创建定时器循环获取最新的插画ID，使用默认间隔
        const intervalId = await createSubscribeTimer(parseInt(userId), e.group_id, config.pixiv.defaultInterval);
        pixivSubscribeTimerDict.set({ userId: parseInt(userId), groupId: e.group_id }, intervalId);
    }
    async unsubscribe(e) {
        let userId;
        try {
            userId = e.msg.match(/#pixiv订阅 (\d+)/)[1];
        }
        catch (error) {
            return e.reply("请输入正确的pixiv订阅指令");
        }
        removeSubscribe(parseInt(userId), e.group_id);
    }
}
//# sourceMappingURL=pixiv.js.map