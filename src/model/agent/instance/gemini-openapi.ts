import { ChatAgent } from "../chatAgent.js";
import { ComplexJMsg, HistoryComplexJMsg, HistorySimpleJMsg, Request } from "../../../type.js";
import { config } from "../../../config/index.js";

export class GeminiOpenAPI extends ChatAgent {
    constructor(apiKey: string) { super(apiKey); }
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
        // 构造请求体
        let request: Request = {
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
    public async visualRequest(groupId: number, model: string, nickName: string, j_msg: ComplexJMsg, historyMessages?: HistoryComplexJMsg[], useSystemRole?: boolean): Promise<any> {
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
        let response = await super.commonRequestVisual(groupId, JSON.parse(JSON.stringify(request)), nickName, j_msg, historyMessages, useSystemRole);
        return response;
    }

    async toolRequest(model: string, j_msg: { img?: string[], text: string[] }): Promise<any> {
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
        var response = await super.commonRequestTool(JSON.parse(JSON.stringify(request)), j_msg);
        return response;
    }
}
