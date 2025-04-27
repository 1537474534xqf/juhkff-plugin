/**
 * @file chatApi.ts
 * @fileoverview 聊天接口定义和公用函数
 * @author juhkff
 */
import setting from "../setting.js";
import { Objects } from "../../utils/kits.js";
import { EMOTION_KEY } from "../../utils/redis.js";
import { AutoReply } from "../../config/define/autoReply.js";

export default abstract class ChatAgent {
    protected config: AutoReply;
    protected apiKey: string;
    protected apiBaseUrl: undefined | string;
    protected abstract models: Record<string, any> | null;
    protected constructor(apiBaseUrl: string | null = null) {
        this.config = setting.getConfig("autoReply");
        this.apiKey = this.config.chatApiKey;
        if (apiBaseUrl)
            this.apiBaseUrl = apiBaseUrl;
        else
            this.apiBaseUrl = this.config.apiCustomUrl;
    }

    /**
     * 生成 role = system 的内容
     * @param useEmotion 是否使用情感
     * @param chatPrompt 聊天预设
     * @returns `{role: 'system', content: 'xxx'}`
     */
    protected async generateSystemContent(useEmotion: boolean, chatPrompt: null | undefined | string): Promise<{ role: "system", content: string }> {
        if (Objects.isNull(chatPrompt))
            chatPrompt =
                "You are a helpful assistant, you must speak Chinese. Now you are in a chat group, and the following is chat history";
        var emotionPrompt = await redis.get(EMOTION_KEY);
        return {
            role: "system",
            // todo 按deepseek-r1的模板修正格式，之后有问题再说
            content: (useEmotion ?
                `${chatPrompt} \n 你的情感倾向——${emotionPrompt.replace(/\n/g, "").replace(/\s+/g, "")}`
                : chatPrompt) as string
        };
    }

    protected async generateSystemContentVisual(useEmotion: boolean, chatPrompt: null | undefined | string): Promise<{ role: "system", content: { type: "text", text: string }[] }> {
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
                    : chatPrompt) as string,
            }],
        };
    }
}
