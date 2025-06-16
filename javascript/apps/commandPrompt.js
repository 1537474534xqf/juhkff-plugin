import { config } from "../config/index.js";
import { agent } from "../model/map.js";
import { Objects } from "../utils/kits.js";
// export const help = () => {
//     return {
//         name: "命令预设",
//         type: "active",
//         dsc: "根据预设和群BOT进行情景互动",
//         enable: config.commandPrompt.useCommandPrompt,
//     }
// }
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
        let content = e.msg;
        content = content.replace(/^#+/, '');
        if (!config.commandPrompt.useCommandPrompt || Objects.isNull(content))
            return false;
        const command = config.commandPrompt.commandDict.find(cmdObj => cmdObj.cmd === content);
        if (!command)
            return false;
        const reqText = command.prompt[Math.floor(Math.random() * command.prompt.length)].text;
        if (!agent.chat)
            return "请开启主动群聊并设置有效的AI接口";
        const cmdMsg = [];
        cmdMsg.push({ content: reqText, message_id: e.message_id, role: "system" });
        const result = await agent.chat.chatRequest(e.group_id, config.autoReply.chatModel, null, cmdMsg, false);
        cmdMsg.push({ role: "assistant", message_id: 0, content: result });
        await e.reply(result);
        while (true) {
            const ue = await this.awaitContext(true, command.timeout);
            if (typeof ue === "boolean" && ue === false) {
                if (!Objects.isNull(command.timeoutChat))
                    await e.reply(command.timeoutChat);
                break;
            }
            // 不知道怎么写好，先这么写了
            this.finish("resolveContext", true);
            const { msg: text } = ue;
            if (text === "#结束")
                break;
            const history = [];
            for (let i = 0; i < cmdMsg.length; i++)
                history.push({ role: cmdMsg[i].role, message_id: cmdMsg[i].message_id, content: cmdMsg[i].content });
            cmdMsg.push({ content: text, message_id: ue.message_id, role: "user" });
            const result = await agent.chat.chatRequest(ue.group_id, config.autoReply.chatModel, text, history, false);
            if (!Objects.isNull(command.finishMsg)) {
                const finishMsgList = command.finishMsg.split("|");
                for (const each of finishMsgList) {
                    if (result.includes(each.trim())) {
                        await ue.reply(result);
                        return true;
                    }
                }
            }
            cmdMsg.push({ content: result, message_id: 0, role: "assistant" });
            await ue.reply(result);
        }
        return true;
    }
}
/*
function extractText(message: [{ type: string, text?: string }]) {
    return message.filter(item => item.type === "text" && typeof item.text === "string").map(item => item.text as string).join("");
}
*/
