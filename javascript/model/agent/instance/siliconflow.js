import axios from "axios";
import { OpenAI } from "../openaiAgent.js";
export class Siliconflow extends OpenAI {
    constructor(apiKey) { super(apiKey, "https://api.siliconflow.cn/v1"); }
    static hasVisual = () => true;
    async visualModels() {
        // TODO SF官网的API竟然不能查询特定Tag，只能自己写在这了，时不时更新一下
        return {
            "Qwen/Qwen2.5-VL-72B-Instruct": {
                chat: super.commonRequestVisual.bind(this),
                tool: super.commonRequestTool.bind(this),
            },
            "Pro/Qwen/Qwen2.5-VL-7B-Instruct": {
                chat: super.commonRequestVisual.bind(this),
                tool: super.commonRequestTool.bind(this),
            },
            "Qwen/QVQ-72B-Preview": {
                chat: super.commonRequestVisual.bind(this),
                tool: super.commonRequestTool.bind(this),
            },
            "Qwen/Qwen2-VL-72B-Instruct": {
                chat: super.commonRequestVisual.bind(this),
                tool: super.commonRequestTool.bind(this),
            },
            "deepseek-ai/deepseek-vl2": {
                chat: super.commonRequestVisual.bind(this),
                tool: super.commonRequestTool.bind(this),
            },
            "Pro/Qwen/Qwen2-VL-7B-Instruct": {
                chat: super.commonRequestVisual.bind(this),
                tool: super.commonRequestTool.bind(this),
            },
            "输入其它模型（请勿选择该项）": null
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
            modelMap[model.id] = super.commonRequestChat.bind(this);
        }
        modelMap["输入其它模型（请勿选择该项）"] = null;
        return modelMap;
    }
    async chatRequest(groupId, model, input, historyMessages, useSystemRole) {
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
        if (!this.modelsChat.hasOwnProperty(model) || this.modelsChat[model] === null) {
            let response = await super.commonRequestChat(groupId, request, input, historyMessages, useSystemRole);
            return response;
        }
        else {
            let response = await this.modelsChat[model](groupId, request, input, historyMessages, useSystemRole);
            return response;
        }
    }
    async visualRequest(groupId, model, nickName, j_msg, historyMessages, useSystemRole) {
        /*
        if (!this.modelsVisual[model]) {
            logger.error("[autoReply]不支持的视觉模型：" + model);
            return "[autoReply]不支持的视觉模型：" + model;
        }
        */
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
        if (!this.modelsVisual.hasOwnProperty(model) || this.modelsVisual[model] === null) {
            let response = await super.commonRequestVisual(groupId, JSON.parse(JSON.stringify(request)), nickName, j_msg, historyMessages, useSystemRole);
            return response;
        }
        else {
            let response = await this.modelsVisual[model].chat(groupId, JSON.parse(JSON.stringify(request)), nickName, j_msg, historyMessages, useSystemRole);
            return response;
        }
    }
    async toolRequest(model, j_msg) {
        /*
        if (!this.modelsVisual[model]) {
            logger.error(`[sf]不支持的视觉模型: ${model}`);
            return `[sf]不支持的视觉模型: ${model}`;
        }
        */
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
        if (!this.modelsVisual.hasOwnProperty(model) || this.modelsVisual[model] === null) {
            let response = await super.commonRequestTool(JSON.parse(JSON.stringify(request)), j_msg);
            return response;
        }
        else {
            let response = await this.modelsVisual[model].tool(JSON.parse(JSON.stringify(request)), j_msg);
            return response;
        }
    }
}
