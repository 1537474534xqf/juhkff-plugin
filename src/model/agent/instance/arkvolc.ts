import { config } from "../../../config/index.js";
import { Request, RequestBody } from "../../../type.js";
import { ChatAgent } from "../chatAgent.js";

export class ArkEngine extends ChatAgent {
    constructor(apiKey: string) {
        super(apiKey);
    }
    static hasVisual = () => false;

    public async chatRequest(model: string, input: string, historyMessages: any[] = [], useSystemRole: boolean = true) {
        // 构造请求体
        let request: Request = {
            url: config.autoReply.apiCustomUrl as string,
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
    private async commonRequest(request: Request, input: string, historyMessages: any[] = [], useSystemRole: boolean = true) {
        if (useSystemRole) {
            let systemContent = await this.generateSystemContent(config.autoReply.useEmotion, config.autoReply.chatPrompt);
            (request.options.body as RequestBody).messages.push(systemContent);
        }
        // 添加历史对话
        if (historyMessages && historyMessages.length > 0) {
            historyMessages.forEach((msg) => {
                // 不是图片时添加
                if (!msg.imageBase64) {
                    (request.options.body as RequestBody).messages.push({ role: msg.role, content: msg.content });
                }
            });
        }
        (request.options.body as RequestBody).messages.push({ role: "user", content: input });
        logger.info(`[autoReply]火山方舟 API调用，请求内容：${JSON.stringify(request, null, 2)}`);
        try {
            request.options.body = JSON.stringify(request.options.body);
            let response = await fetch(request.url, request.options as RequestInit);

            const data = await response.json();

            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            } else {
                logger.error(`[autoReply]火山方舟调用失败: ${JSON.stringify(data, null, 2)}`);
                return "[autoReply]火山方舟调用失败，详情请查阅控制台。";
            }
        } catch (error) {
            logger.error(`[autoReply]火山方舟调用失败`, error);
            return "[autoReply]火山方舟调用失败，详情请查阅控制台。";
        }
    }

    chatModels(): Promise<Record<string, Function> | undefined> {
        return undefined;
    }
    visualModels(): Promise<Record<string, { chat: Function; tool: Function; }> | undefined> {
        return undefined;
    }
    visualRequest(model: string, nickName: string, j_msg: any, historyMessages?: any[], useSystemRole?: boolean): Promise<any> {
        return undefined;
    }
    toolRequest(model: string, j_msg: any): Promise<any> {
        return undefined;
    }
}
