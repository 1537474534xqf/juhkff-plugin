import axios from "axios";
import { ChatAgent } from "../chatAgent.js";
import { Objects } from "../../../utils/kits.js";
import { config } from "../../../config/index.js";
export class Siliconflow extends ChatAgent {
    constructor(apiKey) { super(apiKey, "https://api.siliconflow.cn/v1"); }
    static hasVisual = () => true;
    async visualModels() {
        // TODO SF官网的API竟然不能查询特定Tag，只能自己写在这了，时不时更新一下
        return {
            "Qwen/Qwen2.5-VL-72B-Instruct": {
                chat: this.commonRequestVisual.bind(this),
                tool: this.commonRequestTool.bind(this),
            },
            "Pro/Qwen/Qwen2.5-VL-7B-Instruct": {
                chat: this.commonRequestVisual.bind(this),
                tool: this.commonRequestTool.bind(this),
            },
            "Qwen/QVQ-72B-Preview": {
                chat: this.commonRequestVisual.bind(this),
                tool: this.commonRequestTool.bind(this),
            },
            "Qwen/Qwen2-VL-72B-Instruct": {
                chat: this.commonRequestVisual.bind(this),
                tool: this.commonRequestTool.bind(this),
            },
            "deepseek-ai/deepseek-vl2": {
                chat: this.commonRequestVisual.bind(this),
                tool: this.commonRequestTool.bind(this),
            },
            "Pro/Qwen/Qwen2-VL-7B-Instruct": {
                chat: this.commonRequestVisual.bind(this),
                tool: this.commonRequestTool.bind(this),
            },
        };
    }
    async chatModels() {
        let response = await axios.get(`${this.apiUrl}/models?type=text`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
        });
        let modelMap = {};
        let models = response.data.data;
        for (const model of models) {
            modelMap[model.id] = this.commonRequestChat.bind(this);
        }
        return modelMap;
    }
    async chatRequest(model, input, historyMessages, useSystemRole) {
        // 构造请求体
        var request = {
            url: `${this.apiUrl}/chat/completions`,
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
        let response = await this.modelsChat[model](request, input, historyMessages, useSystemRole);
        return response;
    }
    async visualRequest(model, nickName, j_msg, historyMessages, useSystemRole) {
        if (!this.modelsVisual[model]) {
            logger.error("[autoReply]不支持的视觉模型：" + model);
            return "[autoReply]不支持的视觉模型：" + model;
        }
        let request = {
            url: `${this.apiUrl}/chat/completions`,
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
        let response = await this.modelsVisual[model].chat(JSON.parse(JSON.stringify(request)), nickName, j_msg, historyMessages, useSystemRole);
        return response;
    }
    async toolRequest(model, j_msg) {
        if (!this.modelsVisual[model]) {
            logger.error(`[sf]不支持的视觉模型: ${model}`);
            return `[sf]不支持的视觉模型: ${model}`;
        }
        var request = {
            url: `${this.apiUrl}/chat/completions`,
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
        var response = await this.modelsVisual[model].tool(JSON.parse(JSON.stringify(request)), j_msg);
        return response;
    }
    async commonRequestChat(request, input, historyMessages = [], useSystemRole = true) {
        if (useSystemRole) {
            var systemContent = await this.generateSystemContent(config.autoReply.useEmotion, config.autoReply.chatPrompt);
            request.options.body.messages.push(systemContent);
        }
        // 添加历史对话
        if (historyMessages && historyMessages.length > 0) {
            historyMessages.forEach((msg) => {
                // 不是图片时添加
                if (!msg.imageBase64) {
                    request.options.body.messages.push({ role: msg.role, content: msg.content });
                }
            });
        }
        request.options.body.messages.push({ role: "user", content: input });
        logger.info(`[sf]Siliconflow API调用，请求内容：${JSON.stringify(request, null, 2)}`);
        try {
            request.options.body = JSON.stringify(request.options.body);
            let response = await fetch(request.url, request.options);
            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            }
            else {
                logger.error("[sf]Siliconflow调用失败：", JSON.stringify(data, null, 2));
                return "[sf]Siliconflow调用失败，详情请查阅控制台。";
            }
        }
        catch (error) {
            logger.error("[sf]Siliconflow调用失败", error);
            return "[sf]Siliconflow调用失败，详情请查阅控制台。";
        }
    }
    async commonRequestVisual(request, nickeName, j_msg, historyMessages, useSystemRole) {
        if (useSystemRole) {
            var systemContent = await this.generateSystemContentVisual(config.autoReply.useEmotion, config.autoReply.chatPrompt);
            request.options.body.messages.push(systemContent);
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
                if (!Objects.isNull(msg.sourceText))
                    finalMsg += msg.sourceText;
                if (!Objects.isNull(msg.text))
                    finalMsg += msg.text;
                if (!Objects.isNull(finalMsg)) {
                    if (history.role == "assistant") {
                        // TODO 机器人的记录如果添加上时间戳和昵称，生成的结果容易也包含这些，看上去就很假
                        content.push({ type: "text", text: finalMsg });
                    }
                    else {
                        content.push({ type: "text", text: history.time + " - " + history.nickName + "：" + finalMsg });
                    }
                    hasContent = true;
                }
                // TODO 如果content只有notProcessed部分有内容，例如发送默认表情(type==face)情况，就直接跳过不加
                if (hasContent) {
                    request.options.body.messages.push({ role: history.role, content: content });
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
        request.options.body.messages.push({ role: "user", content: content });
        // 创建打印用副本
        var logRequest = JSON.parse(JSON.stringify(request));
        logRequest.options.body.messages.forEach((message) => {
            var content = message.content;
            content.forEach((item) => {
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
        var response;
        try {
            request.options.body = JSON.stringify(request.options.body);
            response = await fetch(request.url, request.options);
            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            }
            else {
                logger.error("[autoReply]视觉模型API调用失败：", JSON.stringify(data, null, 2));
                return "[autoReply]视觉模型API调用失败，详情请查阅控制台。";
            }
        }
        catch (error) {
            logger.error("[autoReply]视觉模型API调用失败", error);
            return "[autoReply]视觉模型API调用失败，详情请查阅控制台。";
        }
    }
    /**
     * 工具请求
     * @param {*} request
     * @param {*} j_msg:{img:[],text:[]}
     */
    async commonRequestTool(request, j_msg) {
        var content = [];
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
        request.options.body.messages.push({ role: "user", content: content });
        // 创建打印用副本
        var logRequest = JSON.parse(JSON.stringify(request));
        logRequest.options.body.messages.forEach((message) => {
            var content = message.content;
            content.forEach((item) => {
                if (item.type == "image_url") {
                    // 截断前40位
                    item.image_url.url = item.image_url.url.substring(0, 40) + "...";
                }
                if (item.type == "text" && item.text.length > 40) {
                    item.text = item.text.substring(0, 40) + "...";
                }
            });
        });
        logger.info(`[autoReply]视觉模型 ${logRequest.options.body.model} API工具请求调用，请求内容：${JSON.stringify(logRequest, null, 2)}`);
        var response;
        try {
            request.options.body = JSON.stringify(request.options.body);
            response = await fetch(request.url, request.options);
            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            }
            else {
                logger.error(`[autoReply]视觉模型API工具请求调用失败: ${JSON.stringify(data, null, 2)}`);
                return "[autoReply]视觉模型API工具请求调用失败，详情请查阅控制台。";
            }
        }
        catch (error) {
            logger.error("[autoReply]视觉模型API工具请求调用失败", error);
            return "[autoReply]视觉模型API工具请求调用失败，详情请查阅控制台。";
        }
    }
}
//# sourceMappingURL=siliconflow.js.map