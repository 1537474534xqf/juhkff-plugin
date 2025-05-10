/**
 * @file chatApi.ts
 * @fileoverview 聊天接口定义和公用函数
 * @author juhkff
 */
import { config } from "../../config/index.js";
import { ComplexJMsg, HistoryComplexJMsg, HistorySimpleJMsg, Request, RequestBody } from "../../type.js";
import { Objects } from "../../utils/kits.js";
import { EMOTION_KEY } from "../../utils/redis.js";

export interface ChatInterface {
    chatRequest(model: string, input: string, historyMessages?: HistorySimpleJMsg[], useSystemRole?: boolean): Promise<any>;
    chatModels(): Promise<Record<string, Function> | undefined>;
}

export interface VisualInterface {
    visualRequest(model: string, nickName: string, j_msg: ComplexJMsg, historyMessages?: HistoryComplexJMsg[], useSystemRole?: boolean): Promise<any>;
    toolRequest(model: string, j_msg: { img?: string[], text: string[] }): Promise<any>;
    visualModels(): Promise<Record<string, { chat: Function, tool: Function }> | undefined>;
}

export abstract class ChatAgent implements ChatInterface, VisualInterface {
    public apiKey: string;
    public apiUrl: undefined | string = undefined;
    public modelsChat: Record<string, Function>;
    public modelsVisual: Record<string, { chat: Function, tool: Function }>;
    constructor(apiKey: string, apiUrl: string | null = null) {
        this.apiKey = apiKey;
        if (apiUrl)
            this.apiUrl = apiUrl;
        (async () => {
            this.modelsChat = await this.chatModels();
            this.modelsVisual = await this.visualModels();
        })()
    }

    public static hasVisual = (): boolean => { throw new Error("Method not implemented."); }

    abstract chatModels(): Promise<Record<string, Function> | undefined>;
    abstract chatRequest(model: string, input: string, historyMessages?: HistorySimpleJMsg[], useSystemRole?: boolean): Promise<any>;
    abstract visualModels(): Promise<Record<string, { chat: Function, tool: Function }> | undefined>;
    abstract visualRequest(model: string, nickName: string, j_msg: ComplexJMsg, historyMessages?: HistoryComplexJMsg[], useSystemRole?: boolean): Promise<any>;
    abstract toolRequest(model: string, j_msg: { img?: string[], text: string[] }): Promise<any>;

    /**
     * 生成 role = system 的内容
     * @param useEmotion 是否使用情感
     * @param chatPrompt 聊天预设
     * @returns `{role: 'system', content: 'xxx'}`
     */
    protected async generateSystemContent(useEmotion: boolean, chatPrompt: null | undefined | string): Promise<{ role?: "system", content?: string } & Record<string, any>> {
        if (Objects.isNull(chatPrompt))
            chatPrompt =
                "You are a helpful assistant, you must speak Chinese. Now you are in a chat group, and the following is chat history";
        var emotionPrompt = await redis.get(EMOTION_KEY);
        return {
            role: "system",
            // 按deepseek-r1的模板修正格式
            content: (useEmotion ?
                `${chatPrompt} \n 你的情感倾向——${emotionPrompt.replace(/\n/g, "").replace(/\s+/g, "")}`
                : chatPrompt) as string
        };
    }

    protected async generateSystemContentVisual(useEmotion: boolean, chatPrompt: null | undefined | string): Promise<{ role?: "system", content: ({ type?: "text", text?: string } & Record<string, any>)[] }> {
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
    protected async commonRequestChat(request: Request, input: string, historyMessages: HistorySimpleJMsg[] = [], useSystemRole = true) {
        if (useSystemRole) {
            var systemContent = await this.generateSystemContent(config.autoReply.useEmotion, config.autoReply.chatPrompt);
            (request.options.body as RequestBody).messages.push(systemContent);
        }
        // 添加历史对话
        if (historyMessages && historyMessages.length > 0) {
            historyMessages.forEach((msg) => {
                // 不是图片时添加
                // if (!msg.imageBase64) {
                (request.options.body as RequestBody).messages.push({ role: msg.role, content: msg.content });
                // }
            });
        }
        (request.options.body as RequestBody).messages.push({ role: "user", content: input });
        if (config.autoReply.debugMode)
            logger.info(`[autoReply]对话模型 ${(request.options.body as RequestBody).model} API调用，请求内容：${JSON.stringify(request, null, 2)}`);
        try {
            request.options.body = JSON.stringify(request.options.body);
            let response = await fetch(request.url, request.options as RequestInit);
            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            } else {
                logger.error(`[autoReply]对话模型调用失败：`, JSON.stringify(data, null, 2));
                return `[autoReply]对话模型调用失败，详情请查阅控制台。`;
            }
        } catch (error) {
            logger.error(`[autoReply]对话模型调用失败`, error);
            return `[autoReply]对话模型调用失败，详情请查阅控制台。`;
        }
    }

    protected async commonRequestVisual(request: Request, nickeName: string, j_msg: ComplexJMsg, historyMessages?: HistoryComplexJMsg[], useSystemRole: boolean = true) {
        if (useSystemRole) {
            var systemContent = await this.generateSystemContentVisual(config.autoReply.useEmotion, config.autoReply.chatPrompt);
            (request.options.body as RequestBody).messages.push(systemContent);
        }
        // 添加历史对话
        if (historyMessages && historyMessages.length > 0) {
            historyMessages.forEach((history) => {
                var content = [];
                var hasContent = false;
                var msg = history.content;
                if (!Objects.isNull(msg.sourceImg)) {
                    for (const img of msg.sourceImg) {
                        content.push({ type: "image_url", image_url: { detail: "auto", url: img } });
                    }
                    content.push({
                        type: "text",
                        text: "上述图片中可能包含装饰性图片/表情包（如无文字梗图、通用表情符号或纯娱乐性meme），此类视觉元素不携带实质性信息，在后续内容生成时应予以忽略"
                    });
                    hasContent = true;
                }
                if (!Objects.isNull(msg.img)) {
                    for (const img of msg.img) {
                        content.push({ type: "image_url", image_url: { detail: "auto", url: img } });
                    }
                    content.push({
                        type: "text",
                        text: "上述图片中可能包含装饰性图片/表情包（如无文字梗图、通用表情符号或纯娱乐性meme），此类视觉元素不携带实质性信息，在后续内容生成时应予以忽略",
                    });
                    hasContent = true;
                }
                // TODO 引用消息文本和消息正文拼接，不参与描述引用图片，先按这种逻辑实现试试
                let finalMsg = "";
                if (!Objects.isNull(msg.sourceText)) finalMsg += msg.sourceText;
                if (!Objects.isNull(msg.text)) finalMsg += msg.text;
                if (!Objects.isNull(finalMsg)) {
                    if (history.role == "assistant") {
                        // TODO 机器人的记录如果添加上时间戳和昵称，生成的结果容易也包含这些，看上去就很假
                        content.push({ type: "text", text: finalMsg });
                    } else {
                        content.push({ type: "text", text: history.time + " - " + history.nickName + "：" + finalMsg });
                    }
                    hasContent = true;
                }
                // TODO 如果content只有notProcessed部分有内容，例如发送默认表情(type==face)情况，就直接跳过不加
                if (hasContent) {
                    (request.options.body as RequestBody).messages.push({ role: history.role, content: content });
                }
            });
        }
        // j_msg = {sourceImg: [], sourceText: "", img: [], text: "", notProcessed: []}
        // 添加消息内容
        let content = [];
        if (!Objects.isNull(j_msg.sourceImg)) {
            for (const img of j_msg.sourceImg) {
                content.push({ type: "image_url", image_url: { detail: "auto", url: img } });
            }
            content.push({
                type: "text",
                text: "上述图片中可能包含装饰性图片/表情包（如无文字梗图、通用表情符号或纯娱乐性meme），此类视觉元素不携带实质性信息，在后续内容生成时应予以忽略",
            });
        }
        if (!Objects.isNull(j_msg.img)) {
            for (const img of j_msg.img) {
                content.push({
                    type: "image_url",
                    image_url: { detail: "auto", url: img },
                });
            }
            content.push({
                type: "text",
                text: "上述图片中可能包含装饰性图片/表情包（如无文字梗图、通用表情符号或纯娱乐性meme），此类视觉元素不携带实质性信息，在后续内容生成时应予以忽略",
            });
        }
        // TODO 引用消息文本和消息正文拼接，不参与描述引用图片，先按这种逻辑实现试试
        var finalMsg = j_msg.text;
        if (!Objects.isNull(finalMsg) && !Objects.isNull(j_msg.sourceText))
            finalMsg = j_msg.sourceText + finalMsg;
        if (!Objects.isNull(finalMsg)) {
            content.push({ type: "text", text: nickeName + "：" + finalMsg });
        }

        (request.options.body as RequestBody).messages.push({ role: "user", content: content });
        if (config.autoReply.debugMode) {
            // 创建打印用副本
            var logRequest = JSON.parse(JSON.stringify(request));
            logRequest.options.body.messages.forEach((message: any) => {
                var content = message.content;
                content.forEach((item: any) => {
                    if (item.type == "image_url") {
                        // 截断前40位
                        item.image_url.url = item.image_url.url.substring(0, 40) + "...";
                    }
                    if (item.type == "text" && item.text.length > 40) {
                        item.text = item.text.substring(0, 40) + "...";
                    }
                });
            });

            logger.info(`[autoReply]视觉模型 ${logRequest.options.body.model} API调用，请求内容：${JSON.stringify(logRequest, null, 2)}`);
        }
        var response: Response;
        try {
            request.options.body = JSON.stringify(request.options.body);
            response = await fetch(request.url, request.options as RequestInit);
            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            } else {
                logger.error("[autoReply]视觉模型API调用失败：", JSON.stringify(data, null, 2));
                return "[autoReply]视觉模型API调用失败，详情请查阅控制台。";
            }
        } catch (error) {
            logger.error("[autoReply]视觉模型API调用失败", error);
            return "[autoReply]视觉模型API调用失败，详情请查阅控制台。";
        }
    }

    /**
     * 工具请求
     * @param {*} request
     * @param {*} j_msg:{img:[],text:[]}
     */
    protected async commonRequestTool(request: Request, j_msg: { img?: string[], text: string[] }) {
        var content: any[] = [];
        if (!Objects.isNull(j_msg.img)) {
            j_msg.img.forEach((base64) => {
                content.push({
                    type: "image_url",
                    image_url: { detail: "auto", url: base64 },
                });
            });
        }
        if (!Objects.isNull(j_msg.text)) {
            j_msg.text.forEach((text) => {
                content.push({ type: "text", text: text });
            });
        }
        (request.options.body as RequestBody).messages.push({ role: "user", content: content });

        if (config.autoReply.debugMode) {
            // 创建打印用副本
            var logRequest: Request = JSON.parse(JSON.stringify(request));
            (logRequest.options.body as RequestBody).messages.forEach((message: any) => {
                var content = message.content;
                content.forEach((item: any) => {
                    if (item.type == "image_url") {
                        // 截断前40位
                        item.image_url.url = item.image_url.url.substring(0, 40) + "...";
                    }
                    if (item.type == "text" && item.text.length > 40) {
                        item.text = item.text.substring(0, 40) + "...";
                    }
                });
            });
            logger.info(`[autoReply]视觉模型 ${(logRequest.options.body as RequestBody).model} API工具请求调用，请求内容：${JSON.stringify(logRequest, null, 2)}`);
        }
        var response: Response;
        try {
            request.options.body = JSON.stringify(request.options.body);
            response = await fetch(request.url, request.options as RequestInit);
            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            } else {
                logger.error(`[autoReply]视觉模型API工具请求调用失败: ${JSON.stringify(data, null, 2)}`);
                return "[autoReply]视觉模型API工具请求调用失败，详情请查阅控制台。";
            }
        } catch (error) {
            logger.error("[autoReply]视觉模型API工具请求调用失败", error);
            return "[autoReply]视觉模型API工具请求调用失败，详情请查阅控制台。";
        }
    }
}
