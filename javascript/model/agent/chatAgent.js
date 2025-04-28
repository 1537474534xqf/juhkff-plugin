/**
 * @file chatApi.ts
 * @fileoverview 聊天接口定义和公用函数
 * @author juhkff
 */
import { Objects } from "../../utils/kits.js";
import { EMOTION_KEY } from "../../utils/redis.js";
export class ChatAgent {
    apiUrl = undefined;
    modelsChat;
    modelsVisual;
    constructor(apiBaseUrl = null) {
        if (apiBaseUrl)
            this.apiUrl = apiBaseUrl;
        (async () => {
            this.modelsChat = await this.chatModels();
            this.modelsVisual = await this.visualModels();
        })();
    }
    static hasVisual = () => { throw new Error("Method not implemented."); };
    /**
     * 生成 role = system 的内容
     * @param useEmotion 是否使用情感
     * @param chatPrompt 聊天预设
     * @returns `{role: 'system', content: 'xxx'}`
     */
    async generateSystemContent(useEmotion, chatPrompt) {
        if (Objects.isNull(chatPrompt))
            chatPrompt =
                "You are a helpful assistant, you must speak Chinese. Now you are in a chat group, and the following is chat history";
        var emotionPrompt = await redis.get(EMOTION_KEY);
        return {
            role: "system",
            // todo 按deepseek-r1的模板修正格式，之后有问题再说
            content: (useEmotion ?
                `${chatPrompt} \n 你的情感倾向——${emotionPrompt.replace(/\n/g, "").replace(/\s+/g, "")}`
                : chatPrompt)
        };
    }
    async generateSystemContentVisual(useEmotion, chatPrompt) {
        if (Objects.isNull(chatPrompt))
            chatPrompt =
                "You are a helpful assistant, you must speak Chinese. Now you are in a chat group, and the following is chat history";
        var emotionPrompt = await redis.get(EMOTION_KEY);
        return {
            role: "system",
            content: [{
                    type: "text",
                    text: (useEmotion ?
                        `${chatPrompt} \n 你的情感倾向——${emotionPrompt.replace(/\n/g, "").replace(/\s+/g, "")}`
                        : chatPrompt),
                }],
        };
    }
}
//# sourceMappingURL=chatAgent.js.map