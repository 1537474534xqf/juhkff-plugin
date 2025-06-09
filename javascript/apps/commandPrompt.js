import { config } from "../config/index.js";
import { agent } from "../model/map.js";
import { Objects } from "../utils/kits.js";
export const help = () => {
    return {
        name: "命令预设",
        type: "active",
        dsc: "根据预设和群BOT进行情景互动",
        enable: config.commandPrompt.useCommandPrompt,
    };
};
export class CommandPrompt extends plugin {
    constructor() {
        super({
            name: "[扎克芙芙]情景预设",
            dsc: "根据预设和群BOT进行情景互动",
            event: "message",
            priority: 9999, // 优先级，越小越先执行
            rule: [
                {
                    reg: "^#.*", // 仅匹配#开头的文本
                    fnc: "commandPrompt",
                    log: false,
                },
            ],
        });
    }
    async commandPrompt(e) {
        let content = extractText(e.message);
        content = content.replace(/^#+/, '');
        if (!config.commandPrompt.useCommandPrompt || Objects.isNull(content))
            return false;
        const command = config.commandPrompt.commandDict.find(cmdObj => cmdObj.cmd === content);
        if (!command)
            return false;
        const reqText = command.prompt[Math.floor(Math.random() * command.prompt.length)].text;
        if (!agent.chat)
            return "请开启主动群聊并设置有效的AI接口";
        if (this.getContext("continueCommand", true))
            await e.reply("由于发生新请求，情景重置...");
        e.juhkff_cmd_msg = [];
        e.juhkff_cmd_msg.push({ system: reqText });
        this.setContext("continueCommand", true, command.timeout, command.timeoutChat);
        const result = await agent.chat.chatRequest(e.group_id, config.autoReply.chatModel, reqText, [], false);
        e.juhkff_cmd_msg.push({ assistant: result });
        await e.reply(result);
        this.setContext("continueCommand", true, command.timeout, command.timeoutChat);
    }
    async continueCommand(e) {
        const context = this.getContext("continueCommand", true);
        logger.info(context);
    }
}
function extractText(message) {
    return message.filter(item => item.type === "text" && typeof item.text === "string").map(item => item.text).join("");
}
//# sourceMappingURL=commandPrompt.js.map