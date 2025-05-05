import { config } from "../../../config/index.js";
import { ChatAgent } from "../chatAgent.js";
export class ArkEngine extends ChatAgent {
    constructor(apiKey) {
        super(apiKey);
    }
    static hasVisual = () => false;
    async chatRequest(model, input, historyMessages = [], useSystemRole = true) {
        // 构造请求体
        let request = {
            url: config.autoReply.apiCustomUrl,
            options: {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: { model: model, stream: false, messages: [], temperature: 1.5 },
            },
        };
        // var response = await this.ModelMap[model](
        let response = await this.commonRequest(request, input, historyMessages, useSystemRole);
        // 调用返回结果的头尾容易有换行符，进行处理
        response = response.replace(/^\n+|\n+$/g, "");
        return response;
    }
    async commonRequest(request, input, historyMessages = [], useSystemRole = true) {
        if (useSystemRole) {
            let systemContent = await this.generateSystemContent(config.autoReply.useEmotion, config.autoReply.chatPrompt);
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
        logger.info(`[autoReply]火山方舟 API调用，请求内容：${JSON.stringify(request, null, 2)}`);
        try {
            request.options.body = JSON.stringify(request.options.body);
            let response = await fetch(request.url, request.options);
            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            }
            else {
                logger.error(`[autoReply]火山方舟调用失败: ${JSON.stringify(data, null, 2)}`);
                return "[autoReply]火山方舟调用失败，详情请查阅控制台。";
            }
        }
        catch (error) {
            logger.error(`[autoReply]火山方舟调用失败`, error);
            return "[autoReply]火山方舟调用失败，详情请查阅控制台。";
        }
    }
    chatModels() {
        return undefined;
    }
    visualModels() {
        return undefined;
    }
    visualRequest(model, nickName, j_msg, historyMessages, useSystemRole) {
        return undefined;
    }
    toolRequest(model, j_msg) {
        return undefined;
    }
}
//# sourceMappingURL=arkvolc.js.map