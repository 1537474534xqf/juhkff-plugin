import { config } from "../../../config/index.js";
import { ComplexJMsg, HistoryComplexJMsg, HistorySimpleJMsg, Request } from "../../../types/index.js";
import { OpenAI } from "../openaiAgent.js";

export class Siliconflow extends OpenAI {
    constructor(apiKey: { name: string, apiKey: string, enabled: boolean }[]) { super(apiKey, "https://api.siliconflow.cn/v1"); }
    static hasVisual = () => true;

    public async visualModels(): Promise<Record<string, { chat: Function, tool: Function }> | undefined> {
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
    public async chatModels(): Promise<Record<string, Function> | undefined> {
        let response: any;
        for (const eachKey of this.apiKey.filter((key) => key.enabled)) {
            response = await fetch(`${this.apiUrl}/models?type=text`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${eachKey.apiKey}`,
                },
            });
            if (response && response.ok) {
                const modelMap: Record<string, Function> = {};
                const models = await response.json();
                for (const model of models.data) {
                    modelMap[model.id] = super.commonRequestChat.bind(this);
                }
                modelMap["输入其它模型（请勿选择该项）"] = null;
                return modelMap;
            }
        }
        if (this.apiKey.length > 0) {
            const error = await response?.json();
            logger.error(`Siliconflow: 获取模型列表失败，${JSON.stringify(error, null, 2)}`);
            return {};
        }
    }

    async chatRequest(groupId: number, model: string, input: string, historyMessages?: HistorySimpleJMsg[], useSystemRole?: boolean): Promise<any> {
        // 构造请求体
        let response: any;
        for (const eachKey of this.apiKey.filter((key) => key.enabled)) {
            var request: Request = {
                url: `${this.apiUrl}/chat/completions`,
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
                        temperature: 1.5,
                    },
                },
            };
            if (config.autoReply.useChatProxy) request.options.agent = this.proxy;
            if (!this.modelsChat.hasOwnProperty(model) || this.modelsChat[model] === null) {
                response = await super.commonRequestChat(groupId, request, input, historyMessages, useSystemRole);
            } else {
                response = await this.modelsChat[model](groupId, request, input, historyMessages, useSystemRole)
            }
            if (response && response.ok) return response.data;
        }
        if (this.apiKey.length > 0) return response.error;
    }
    public async visualRequest(groupId: number, model: string, nickName: string, j_msg: ComplexJMsg, historyMessages?: HistoryComplexJMsg[], useSystemRole?: boolean): Promise<any> {
        /*
        if (!this.modelsVisual[model]) {
            logger.error("[autoReply]不支持的视觉模型：" + model);
            return "[autoReply]不支持的视觉模型：" + model;
        }
        */
        let response: any;
        for (const eachKey of this.apiKey.filter((key) => key.enabled)) {
            let request: Request = {
                url: `${this.apiUrl}/chat/completions`,
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
            if (config.autoReply.useChatProxy) request.options.agent = this.proxy;
            if (!this.modelsVisual.hasOwnProperty(model) || this.modelsVisual[model] === null) {
                response = await super.commonRequestVisual(groupId, JSON.parse(JSON.stringify(request)), nickName, j_msg, historyMessages, useSystemRole);
            } else {
                response = await this.modelsVisual[model].chat(groupId, JSON.parse(JSON.stringify(request)), nickName, j_msg, historyMessages, useSystemRole);
            }
            if (response && response.ok) return response.data;
        }
        if (this.apiKey.length > 0) return response?.error;
    }

    async toolRequest(model: string, j_msg: { img?: string[], text: string[] }): Promise<any> {
        /*
        if (!this.modelsVisual[model]) {
            logger.error(`[sf]不支持的视觉模型: ${model}`);
            return `[sf]不支持的视觉模型: ${model}`;
        }
        */
        let response: any;
        for (const eachKey of this.apiKey.filter((key) => key.enabled)) {
            var request: Request = {
                url: `${this.apiUrl}/chat/completions`,
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
            if (config.autoReply.useVisualProxy) request.options.agent = this.proxy;
            if (!this.modelsVisual.hasOwnProperty(model) || this.modelsVisual[model] === null) {
                response = await super.commonRequestTool(JSON.parse(JSON.stringify(request)), j_msg);
            } else {
                response = await this.modelsVisual[model].tool(JSON.parse(JSON.stringify(request)), j_msg);
            }
            if (response && response.ok) return response.data;
        }
        if (this.apiKey.length > 0) return response?.error;
    }
}
