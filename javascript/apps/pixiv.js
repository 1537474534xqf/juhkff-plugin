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
            return await e.reply(`订阅pixiv用户 ${userId} 的作品失败，请检查日志。`);
        // 创建定时器循环获取最新的插画ID
        await createSubscribeTimer(userId, config.pixiv.subscribeInterval);
    }
}
//# sourceMappingURL=pixiv.js.map