import { ComplexJMsg, HistoryComplexJMsg, HistorySimpleJMsg, Request } from "../../../types.js";
import { config } from "../../../config/index.js";
import { OpenAI } from "../openaiAgent.js";

export class GeminiOpenAI extends OpenAI {
    constructor(apiKey: { name: string, apiKey: string, enabled: boolean }[]) { super(apiKey); }
    static hasVisual = () => true;

    public async visualModels(): Promise<Record<string, { chat: Function, tool: Function }> | undefined> {
        return {
            "gemini-2.5-flash-preview-04-17": null,
            "gemini-2.5-pro-preview-05-06": null,
            "gemini-2.5-pro-exp-03-25": null,
            "gemini-2.0-flash": null,
            "输入其它模型（请勿选择该项）": null
        };
    }
    public async chatModels(): Promise<Record<string, Function> | undefined> {
        return {
            "gemini-2.5-flash-preview-04-17": null,
            "gemini-2.5-pro-preview-05-06": null,
            "gemini-2.5-pro-exp-03-25": null,
            "gemini-2.0-flash": null,
            "输入其它模型（请勿选择该项）": null
        };
    }

    async chatRequest(groupId: number, model: string, input: string, historyMessages?: HistorySimpleJMsg[], useSystemRole?: boolean): Promise<any> {
        let response: any;
        for (const eachKey of this.apiKey.filter((key) => key.enabled)) {
            // 构造请求体
            let request: Request = {
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
            if (config.autoReply.useChatProxy) request.options.agent = this.proxy;
            // var response = await this.ModelMap[model](
            response = await super.commonRequestChat(groupId, request, input, historyMessages, useSystemRole);
            if (response && response.ok) {
                // 调用返回结果的头尾容易有换行符，进行处理
                response.data = response.data.replace(/^\n+|\n+$/g, "");
                return response.data;
            }
        }
        if (this.apiKey.length > 0) return response?.error;
    }
    public async visualRequest(groupId: number, model: string, nickName: string, j_msg: ComplexJMsg, historyMessages?: HistoryComplexJMsg[], useSystemRole?: boolean): Promise<any> {
        let response: any;
        for (const eachKey of this.apiKey.filter((key) => key.enabled)) {
            let request: Request = {
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
            if (config.autoReply.useChatProxy) request.options.agent = this.proxy;
            response = await super.commonRequestVisual(groupId, JSON.parse(JSON.stringify(request)), nickName, j_msg, historyMessages, useSystemRole);
            if (response && response.ok) return response.data;
        }
        if (this.apiKey.length > 0) return response?.error;
    }

    async toolRequest(model: string, j_msg: { img?: string[], text: string[] }): Promise<any> {
        let response: any;
        for (const eachKey of this.apiKey.filter((key) => key.enabled)) {
            var request: Request = {
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
            if (config.autoReply.useVisualProxy) request.options.agent = this.proxy;
            response = await super.commonRequestTool(JSON.parse(JSON.stringify(request)), j_msg);
            if (response && response.ok) return response.data;
        }
        if (this.apiKey.length > 0) return response?.error;
    }
}
