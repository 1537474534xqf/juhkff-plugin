import { addSubscribe, removeSubscribe } from "../config/define/pixiv.js";

export class pixiv extends plugin {
    constructor() {
        super({
            name: "[扎克芙芙]pixiv插件",
            dsc: "pixiv相关功能",
            event: "message",
            priority: 9999, // 优先级，越小越先执行
            rule: [
                {
                    reg: "^#pixiv订阅 ",
                    fnc: "subscribe",
                },
                {
                    reg: "^#pixiv取消订阅 ",
                    fnc: "unsubscribe",
                },
            ],
        });
    }

    async subscribe(e: E) {
        let userId: string;
        try {
            userId = e.msg.match(/#pixiv订阅 (\d+)/)[1];
        } catch (error) {
            return e.reply("请输入正确的pixiv订阅指令");
        }
        addSubscribe(parseInt(userId), e.group_id);
    }

    async unsubscribe(e: E) {
        let userId: string;
        try {
            userId = e.msg.match(/#pixiv取消订阅 (\d+)/)[1];
        } catch (error) {
            return e.reply("请输入正确的pixiv取消订阅指令");
        }
        removeSubscribe(parseInt(userId), e.group_id);
    }
}