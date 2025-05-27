import { ComplexJMsg, HistoryComplexJMsg, HistorySimpleJMsg, Request } from "../../../types.js";
import { OpenAI } from "../openaiAgent.js";

export class OpenRouter extends OpenAI {
    constructor(apiKey: string) { super(apiKey, "https://openrouter.ai/api/v1"); }

    static hasVisual = () => true;

    async chatModels(): Promise<Record<string, Function> | undefined> {
        // List available models (GET /models)
        const response = await fetch(`${this.apiUrl}/models`, {
            method: "GET",
            headers: {},
        });
        const body = await response.json();
        let modelMap: Record<string, Function> = {};
        let models = body.data;
        for (const model of models) {
            modelMap[model.id] = super.commonRequestChat.bind(this);
        }
        modelMap["输入其它模型（请勿选择该项）"] = null;
        return modelMap;
    }

    async visualModels(): Promise<Record<string, { chat: Function; tool: Function; }> | undefined> {
        const response = await fetch(`${this.apiUrl}/models`, {
            method: "GET",
            headers: {},
        });
        const body = await response.json();
        let modelMap: Record<string, { chat: Function; tool: Function; }> = {};
        let models = body.data;
        // 过滤视觉模型
        models = models.filter((model: { architecture: { input_modalities: string[], output_modalities: string[] } }) =>
            OpenRouter.just_text_response(model.architecture.output_modalities) &&
            model.architecture.input_modalities.includes("image"));
        for (const model of models) {
            modelMap[model.id] = {
                chat: super.commonRequestVisual.bind(this),
                tool: super.commonRequestTool.bind(this)
            }
        }
        modelMap["输入其它模型（请勿选择该项）"] = null;
        return modelMap;
    }

    async chatRequest(groupId: number, model: string, input: string, historyMessages?: HistorySimpleJMsg[], useSystemRole?: boolean): Promise<any> {
        // 构造请求体
        var request: Request = {
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
        } else {
            let response = await this.modelsChat[model](groupId, request, input, historyMessages, useSystemRole)
            return response;
        }
    }
    public async visualRequest(groupId: number, model: string, nickName: string, j_msg: ComplexJMsg, historyMessages?: HistoryComplexJMsg[], useSystemRole?: boolean): Promise<any> {
        /*
        if (!this.modelsVisual[model]) {
            logger.error("[autoReply]不支持的视觉模型：" + model);
            return "[autoReply]不支持的视觉模型：" + model;
        }
        */
        let request: Request = {
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
        } else {
            let response = await this.modelsVisual[model].chat(groupId, JSON.parse(JSON.stringify(request)), nickName, j_msg, historyMessages, useSystemRole);
            return response;
        }
    }

    async toolRequest(model: string, j_msg: { img?: string[], text: string[] }): Promise<any> {
        /*
        if (!this.modelsVisual[model]) {
            logger.error(`[sf]不支持的视觉模型: ${model}`);
            return `[sf]不支持的视觉模型: ${model}`;
        }
        */
        var request: Request = {
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
        } else {
            let response = await this.modelsVisual[model].tool(JSON.parse(JSON.stringify(request)), j_msg);
            return response;
        }
    }

    /**
     * 判断输出是否只有文字，目前其实也只有文字，但以防万一在这里做个过滤
     * @param output_modalities 输出类型
     * @returns 只有 "text"
     */
    static just_text_response(output_modalities: string[]) {
        return output_modalities.length == 1 && output_modalities[0] == "text";
    }
}
