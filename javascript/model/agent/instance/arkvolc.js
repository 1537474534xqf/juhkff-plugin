import { config } from "../../../config/index.js";
import { OpenAI } from "../openaiAgent.js";
export class ArkEngine extends OpenAI {
    constructor(apiKey) {
        super(apiKey);
    }
    static hasVisual = () => true;
    async chatRequest(groupId, model, input, historyMessages, useSystemRole) {
        let response;
        for (const eachKey of this.apiKey.filter((key) => key.enabled)) {
            // 构造请求体
            let request = {
                url: config.autoReply.apiCustomUrl,
                options: {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${eachKey.apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: { model: model, stream: false, messages: [], temperature: 1.5 },
                },
            };
            if (config.autoReply.useChatProxy)
                request.options.agent = this.proxy;
            // var response = await this.ModelMap[model](
            response = await super.commonRequestChat(groupId, request, input, historyMessages, useSystemRole);
            if (response && response.ok) {
                // 调用返回结果的头尾容易有换行符，进行处理
                response.data = response.data.replace(/^\n+|\n+$/g, "");
                return response.data;
            }
        }
        if (this.apiKey.length > 0)
            return response?.error;
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
            "doubao-1-5-thinking-vision-pro-250428": null,
            "doubao-seed-1-6-250615": null,
            "doubao-seed-1-6-thinking-250615": null,
            "doubao-seed-1-6-flash-250615": null,
            "输入其它或自定义模型（请勿选择该项）": null
        };
    }
    async visualRequest(groupId, model, nickName, j_msg, historyMessages, useSystemRole) {
        let response;
        for (const eachKey of this.apiKey.filter((key) => key.enabled)) {
            let request = {
                url: config.autoReply.apiCustomUrl,
                options: {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${eachKey.apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: {
                        model: model,
                        messages: [],
                        stream: false,
                    },
                },
            };
            if (config.autoReply.useChatProxy)
                request.options.agent = this.proxy;
            response = await super.commonRequestVisual(groupId, JSON.parse(JSON.stringify(request)), nickName, j_msg, historyMessages, useSystemRole);
            if (response && response.ok)
                return response.data;
        }
        if (this.apiKey.length > 0)
            return response?.error;
    }
    async toolRequest(model, j_msg) {
        let response;
        for (const eachKey of this.apiKey.filter((key) => key.enabled)) {
            var request = {
                url: config.autoReply.visualApiCustomUrl,
                options: {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${eachKey.apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: {
                        model: model,
                        messages: [],
                        stream: false,
                    },
                },
            };
            if (config.autoReply.useVisualProxy)
                request.options.agent = this.proxy;
            response = await super.commonRequestTool(JSON.parse(JSON.stringify(request)), j_msg);
            if (response && response.ok)
                return response.data;
        }
        if (this.apiKey.length > 0)
            return response?.error;
    }
}
