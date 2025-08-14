import { addSubscribe, removeSubscribe } from "../config/define/pixiv.js";
import { config } from "../config/index.js";

export const help = () => {
    return {
        name: "Pixiv功能",
        type: "group",
        dsc: "主动或定时推送日报",
        enable: config.pixiv.usePixiv,
        subMenu: [
            {
                name: "Pixiv订阅",
                type: "sub",
                command: "#pixiv订阅|取消订阅 [用户ID]",
                dsc: "订阅用户有新插画作品时推送到相关群聊",
                enable: config.pixiv.usePixiv,
            },
        ]
    }
}

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