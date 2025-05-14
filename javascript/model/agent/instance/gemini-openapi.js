import { ChatAgent } from "../chatAgent.js";
import { config } from "../../../config/index.js";
export class GeminiOpenAPI extends ChatAgent {
    constructor(apiKey) { super(apiKey); }
    static hasVisual = () => true;
    async visualModels() {
        return {
            "gemini-2.5-flash-preview-04-17": null,
            "gemini-2.5-pro-preview-05-06": null,
            "gemini-2.5-pro-exp-03-25": null,
            "gemini-2.0-flash": null,
            "输入其它模型（请勿选择该项）": null
        };
    }
    async chatModels() {
        return {
            "gemini-2.5-flash-preview-04-17": null,
            "gemini-2.5-pro-preview-05-06": null,
            "gemini-2.5-pro-exp-03-25": null,
            "gemini-2.0-flash": null,
            "输入其它模型（请勿选择该项）": null
        };
    }
    async chatRequest(model, input, historyMessages, useSystemRole) {
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
        let response = await super.commonRequestChat(request, input, historyMessages, useSystemRole);
        // 调用返回结果的头尾容易有换行符，进行处理
        response = response.replace(/^\n+|\n+$/g, "");
        return response;
    }
    async visualRequest(model, nickName, j_msg, historyMessages, useSystemRole) {
        let request = {
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
        let response = await super.commonRequestVisual(JSON.parse(JSON.stringify(request)), nickName, j_msg, historyMessages, useSystemRole);
        return response;
    }
    async toolRequest(model, j_msg) {
        var request = {
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
        var response = await super.commonRequestTool(JSON.parse(JSON.stringify(request)), j_msg);
        return response;
    }
}
