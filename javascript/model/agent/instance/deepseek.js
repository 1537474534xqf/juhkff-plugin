import { config } from "../../../config/index.js";
import { OpenAI } from "../openaiAgent.js";
export class DeepSeek extends OpenAI {
    constructor(apiKey) { super(apiKey, "https://api.deepseek.com"); }
    static hasVisual = () => false;
    async chatModels() {
        return {
            "deepseek-chat": this.deepseek_chat.bind(this),
            "deepseek-reasoner": this.deepseek_reasoner.bind(this),
        };
    }
    async chatRequest(groupId, model, input, historyMessages, useSystemRole) {
        if (!this.modelsChat[model]) {
            logger.error("[ds]不支持的模型：" + model);
            return "[ds]不支持的模型：" + model;
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
                    temperature: 1.5,
                },
            },
        };
        let response = await this.modelsChat[model](groupId, request, input, historyMessages, useSystemRole);
        // 如果 DeepSeek-R1 失败，尝试使用 DeepSeek-V3
        if (typeof response === "string" && response.startsWith("[ds]DeepSeek-R1调用失败")) {
            request.options.body.model = "deepseek-chat";
            response = await this.deepseek_chat(groupId, JSON.parse(JSON.stringify(request)), input, historyMessages, useSystemRole);
        }
        return response;
    }
    async deepseek_chat(groupId, request, input, historyMessages = [], useSystemRole = true) {
        // 添加消息内容
        if (useSystemRole) {
            let systemContent = await this.generateSystemContent(groupId, config.autoReply.useEmotion, config.autoReply.chatPrompt);
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
        // 添加当前对话
        if (input != null)
            request.options.body.messages.push({ role: "user", content: input });
        logger.info(`[ds]DeepSeek-V3 API调用，请求内容：${JSON.stringify(request, null, 2)}`);
        try {
            request.options.body = JSON.stringify(request.options.body);
            let response = await fetch(request.url, request.options);
            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            }
            else {
                logger.error("[ds]DeepSeek-V3调用失败：", JSON.stringify(data, null, 2));
                return "[ds]DeepSeek-V3调用失败，详情请查阅控制台。";
            }
        }
        catch (error) {
            logger.error(`[ds]DeepSeek-V3调用失败`, error);
            return "[ds]DeepSeek-V3调用失败，详情请查阅控制台。";
        }
    }
    async deepseek_reasoner(groupId, request, input, historyMessages = [], useSystemRole = true) {
        // 添加消息内容
        if (useSystemRole) {
            let systemContent = await this.generateSystemContent(groupId, config.autoReply.useEmotion, config.autoReply.chatPrompt);
            request.options.body.messages.push(systemContent);
        }
        // 添加历史对话
        let content = "";
        // 原则上来说 input 和 historyMessages 不可均为空，所以这里不再做额外判断
        if (historyMessages && historyMessages.length > 0) {
            content += historyMessages
                .filter((msg) => !msg.imageBase64)
                .map((msg) => `"role": "${msg.role}", "content": "${msg.content}",\n`)
                .join("");
            if (input != null)
                content += `"role": "user", "content": "${input}"`;
        }
        else {
            content = input;
        }
        request.options.body.messages.push({ role: "user", content: content });
        logger.info(`[ds]DeepSeek-R1 API调用，请求内容：${JSON.stringify(request, null, 2)}`);
        try {
            request.options.body = JSON.stringify(request.options.body);
            let response = await fetch(request.url, request.options);
            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            }
            else {
                logger.error("[ds]DeepSeek-R1调用失败：", JSON.stringify(data, null, 2));
                return "[ds]DeepSeek-R1调用失败，详情请查阅控制台。";
            }
        }
        catch (error) {
            logger.error(`[ds]DeepSeek-R1调用失败`, error);
            return "[ds]DeepSeek-R1调用失败，详情请查阅控制台。";
        }
    }
    visualRequest(groupId, model, nickName, j_msg, historyMessages, useSystemRole) {
        return undefined;
    }
    toolRequest(model, j_msg) {
        return undefined;
    }
    visualModels() {
        return undefined;
    }
}
