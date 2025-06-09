import { config } from "../../../config/index.js";
import { OpenAI } from "../openaiAgent.js";
export class ArkEngine extends OpenAI {
    constructor(apiKey) {
        super(apiKey);
    }
    static hasVisual = () => true;
    async chatRequest(groupId, model, input, historyMessages, useSystemRole) {
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
        let response = await super.commonRequestChat(groupId, request, input, historyMessages, useSystemRole);
        // 调用返回结果的头尾容易有换行符，进行处理
        response = response.replace(/^\n+|\n+$/g, "");
        return response;
    }
    async chatModels() {
        return {
            "doubao-1-5-pro-32k-250115": null,
            "doubao-1-5-thinking-pro-250415": null,
            "deepseek-r1-250120": null,
            "输入其它或自定义模型（请勿选择该项）": null
        };
    }
    async visualModels() {
        return {
            "doubao-1.5-vision-pro-250328": null,
            "输入其它或自定义模型（请勿选择该项）": null
        };
    }
    async visualRequest(groupId, model, nickName, j_msg, historyMessages, useSystemRole) {
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
        let response = await super.commonRequestVisual(groupId, JSON.parse(JSON.stringify(request)), nickName, j_msg, historyMessages, useSystemRole);
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
//# sourceMappingURL=arkvolc.js.map