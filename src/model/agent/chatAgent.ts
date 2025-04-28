/**
 * @file chatApi.ts
 * @fileoverview 聊天接口定义和公用函数
 * @author juhkff
 */
import { Objects } from "../../utils/kits.js";
import { EMOTION_KEY } from "../../utils/redis.js";

export interface ChatInterface {
    chatRequest(model: string, input: string, historyMessages?: any[], useSystemRole?: boolean): Promise<any>;
    chatModels(): Promise<Record<string, Function> | undefined>;
}

export interface VisualInterface {
    visualRequest(model: string, nickName: string, j_msg: any, historyMessages?: any[], useSystemRole?: boolean): Promise<any>;
    toolRequest(model: string, j_msg: any): Promise<any>;
    visualModels(): Promise<Record<string, { chat: Function, tool: Function }> | undefined>;
}

export abstract class ChatAgent implements ChatInterface, VisualInterface {
    public apiUrl: undefined | string = undefined;
    public modelsChat: Record<string, Function>;
    public modelsVisual: Record<string, { chat: Function, tool: Function }>;
    constructor(apiBaseUrl: string | null = null) {
        if (apiBaseUrl)
            this.apiUrl = apiBaseUrl;
        (async () => {
            this.modelsChat = await this.chatModels();
            this.modelsVisual = await this.visualModels();
        })()
    }

    public static hasVisual = (): boolean => { throw new Error("Method not implemented."); }

    abstract chatRequest(model: string, input: string, historyMessages?: any[], useSystemRole?: boolean): Promise<any>;
    abstract chatModels(): Promise<Record<string, Function> | undefined>;
    abstract visualRequest(model: string, nickName: string, j_msg: any, historyMessages?: any[], useSystemRole?: boolean): Promise<any>;
    abstract toolRequest(model: string, j_msg: any): Promise<any>;
    abstract visualModels(): Promise<Record<string, { chat: Function, tool: Function }> | undefined>;

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
