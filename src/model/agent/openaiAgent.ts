import { config } from "../../config/index.js";
import { HistorySimpleJMsg, ComplexJMsg, HistoryComplexJMsg, Request, RequestBody } from "../../types.js";
import { ChatKits, Objects } from "../../utils/kits.js";
import { EMOTION_KEY } from "../constant.js";
import { ChatAgent } from "./chatAgent.js";

export class OpenAI extends ChatAgent {
    constructor(apiKey: string, apiUrl: string | null = null) { super(apiKey, apiUrl); }

    static hasVisual = () => true;

    async chatModels(): Promise<Record<string, Function> | undefined> {
        return {
            "输入模型名称（请勿选择该项）": null
        };
    }
    async chatRequest(groupId: number, model: string, input: string, historyMessages?: HistorySimpleJMsg[], useSystemRole?: boolean): Promise<any> {
        // 构造请求体
        var request: Request = {
            url: config.autoReply.apiCustomUrl,
            options: {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: {
                    model: model,
                    messages: [],
                    stream: false,
                    temperature: 1.5,
                },
            },
        };
        if (!this.modelsChat.hasOwnProperty(model) || this.modelsChat[model] === null) {
            let response = await this.commonRequestChat(groupId, request, input, historyMessages, useSystemRole);
            return response;
        } else {
            let response = await this.modelsChat[model](groupId, request, input, historyMessages, useSystemRole)
            return response;
        }
    }
    async visualModels(): Promise<Record<string, { chat: Function; tool: Function; }> | undefined> {
        return {
            "输入视觉模型名称（请勿选择该项）": null
        }
    }
    async visualRequest(groupId: number, model: string, nickName: string, j_msg: ComplexJMsg, historyMessages?: HistoryComplexJMsg[], useSystemRole?: boolean): Promise<any> {
        let request: Request = {
            url: config.autoReply.apiCustomUrl,
            options: {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: {
                    model: model,
                    messages: [],
                    stream: false,
                },
            },
        };
        if (!this.modelsVisual.hasOwnProperty(model) || this.modelsVisual[model] === null) {
            let response = await this.commonRequestVisual(groupId, JSON.parse(JSON.stringify(request)), nickName, j_msg, historyMessages, useSystemRole);
            return response;
        } else {
            let response = await this.modelsVisual[model].chat(groupId, JSON.parse(JSON.stringify(request)), nickName, j_msg, historyMessages, useSystemRole);
            return response;
        }
    }
    async toolRequest(model: string, j_msg: { img?: string[]; text: string[]; }): Promise<any> {
        var request: Request = {
            url: config.autoReply.visualApiCustomUrl,
            options: {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: {
                    model: model,
                    messages: [],
                    stream: false,
                },
            },
        };
        if (!this.modelsVisual.hasOwnProperty(model) || this.modelsVisual[model] === null) {
            let response = await this.commonRequestTool(JSON.parse(JSON.stringify(request)), j_msg);
            return response;
        } else {
            let response = await this.modelsVisual[model].tool(JSON.parse(JSON.stringify(request)), j_msg);
            return response;
        }
    }

    //----------------------------------------- function -----------------------------------------

    /**
     * 生成 role = system 的内容
     * @param useEmotion 是否使用情感
     * @param chatPrompt 聊天预设
     * @returns `{role: 'system', content: 'xxx'}`
     */
    protected async generateSystemContent(groupId: number, useEmotion: boolean, chatPrompt: null | undefined | string): Promise<{ role?: "system", content?: string } & Record<string, any>> {
        if (Objects.isNull(chatPrompt))
            chatPrompt =
                "You are a helpful assistant, you must speak Chinese. Now you are in a chat group, and the following is chat history";
        var emotionPrompt = await redis.get(EMOTION_KEY);
        // 传入机器人在群中的昵称
        chatPrompt = ChatKits.replaceWithBotNickName(chatPrompt, groupId);
        return {
            role: "system",
            // 按deepseek-r1的模板修正格式
            content: (useEmotion ?
                `${chatPrompt} \n 你的情感倾向——${emotionPrompt.replace(/\n/g, "").replace(/\s+/g, "")}`
                : chatPrompt) as string
        };
    }

    protected async generateSystemContentVisual(groupId: number, useEmotion: boolean, chatPrompt: null | undefined | string): Promise<{ role?: "system", content: ({ type?: "text", text?: string } & Record<string, any>)[] }> {
        if (Objects.isNull(chatPrompt))
            chatPrompt =
                "You are a helpful assistant, you must speak Chinese. Now you are in a chat group, and the following is chat history";
        var emotionPrompt = await redis.get(EMOTION_KEY);
        chatPrompt = ChatKits.replaceWithBotNickName(chatPrompt, groupId);
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
    protected async commonRequestChat(groupId: number, request: Request, input: string, historyMessages: HistorySimpleJMsg[] = [], useSystemRole = true) {
        if (useSystemRole) {
            var systemContent = await this.generateSystemContent(groupId, config.autoReply.useEmotion, config.autoReply.chatPrompt);
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
        if (input != null)
            (request.options.body as RequestBody).messages.push({ role: "user", content: input });
        if (config.autoReply.debugMode)
            logger.info(`[OpenAI]对话模型 ${(request.options.body as RequestBody).model} API调用，请求内容：${JSON.stringify(request, null, 2)}`);
        try {
            request.options.body = JSON.stringify(request.options.body);
            let response = await fetch(request.url, request.options as RequestInit);
            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            } else {
                logger.error(`[OpenAI]对话模型调用失败：`, JSON.stringify(data, null, 2));
                return `[OpenAI]对话模型调用失败，详情请查阅控制台。`;
            }
        } catch (error) {
            logger.error(`[OpenAI]对话模型调用失败`, error);
            return `[OpenAI]对话模型调用失败，详情请查阅控制台。`;
        }
    }

    protected async commonRequestVisual(groupId: number, request: Request, nickeName: string, j_msg: ComplexJMsg, historyMessages?: HistoryComplexJMsg[], useSystemRole: boolean = true) {
        if (useSystemRole) {
            var systemContent = await this.generateSystemContentVisual(groupId, config.autoReply.useEmotion, config.autoReply.chatPrompt);
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
                    // 如果只发图片会不记录发送人昵称，改为在最后额外发送一条json，指明发送人和时间
                    content.push({ type: "text", text: finalMsg });
                    hasContent = true;
                }
                // TODO 如果content只有notProcessed部分有内容，例如发送默认表情(type==face)情况，就直接跳过不加
                if (hasContent) {
                    // 在content头部插入
                    if (history.role != "assistant") content.unshift({ type: "text", text: `${history.time} - ${history.nickName} 发送消息如下：` });
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
            content.push({ type: "text", text: finalMsg });
        }
        if (content.length > 0) content.unshift({ type: "text", text: `${nickeName} 发送消息如下：` });


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
                    /*
                    if (item.type == "text" && item.text.length > 40) {
                        item.text = item.text.substring(0, 40) + "...";
                    }
                    */
                });
            });

            logger.info(`[OpenAI]视觉模型 ${logRequest.options.body.model} API调用，请求内容：${JSON.stringify(logRequest, null, 2)}`);
        }
        var response: Response;
        try {
            request.options.body = JSON.stringify(request.options.body);
            response = await fetch(request.url, request.options as RequestInit);
            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            } else {
                logger.error("[OpenAI]视觉模型API调用失败：", JSON.stringify(data, null, 2));
                return "[OpenAI]视觉模型API调用失败，详情请查阅控制台。";
            }
        } catch (error) {
            logger.error("[OpenAI]视觉模型API调用失败", error);
            return "[OpenAI]视觉模型API调用失败，详情请查阅控制台。";
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
                    /*
                    if (item.type == "text" && item.text.length > 40) {
                        item.text = item.text.substring(0, 40) + "...";
                    }
                    */
                });
            });
            logger.info(`[OpenAI]视觉模型 ${(logRequest.options.body as RequestBody).model} API工具请求调用，请求内容：${JSON.stringify(logRequest, null, 2)}`);
        }
        var response: Response;
        try {
            request.options.body = JSON.stringify(request.options.body);
            response = await fetch(request.url, request.options as RequestInit);
            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            } else {
                logger.error(`[OpenAI]视觉模型API工具请求调用失败: ${JSON.stringify(data, null, 2)}`);
                return "[OpenAI]视觉模型API工具请求调用失败，详情请查阅控制台。";
            }
        } catch (error) {
            logger.error("[OpenAI]视觉模型API工具请求调用失败", error);
            return "[OpenAI]视觉模型API工具请求调用失败，详情请查阅控制台。";
        }
    }
}