/**
 * @file chatApi.ts
 * @fileoverview 聊天接口定义和公用函数
 * @author juhkff
 */
import { ComplexJMsg, HistoryComplexJMsg, HistorySimpleJMsg } from "../../types.js";

export interface ChatInterface {
    chatRequest(groupId: number, model: string, input: string, historyMessages?: HistorySimpleJMsg[], useSystemRole?: boolean): Promise<any>;
    chatModels(): Promise<Record<string, Function> | undefined>;
}

export interface VisualInterface {
    visualRequest(groupId: number, model: string, nickName: string, j_msg: ComplexJMsg, historyMessages?: HistoryComplexJMsg[], useSystemRole?: boolean): Promise<any>;
    toolRequest(model: string, j_msg: { img?: string[], text: string[] }): Promise<any>;
    visualModels(): Promise<Record<string, { chat: Function, tool: Function }> | undefined>;
}

export abstract class ChatAgent implements ChatInterface, VisualInterface {
    public apiKey: string;
    public apiUrl: undefined | string = undefined;
    public modelsChat: Record<string, Function> = {};
    public modelsVisual: Record<string, { chat: Function, tool: Function }> = {};
    constructor(apiKey: string, apiUrl: string | null = null) {
        this.apiKey = apiKey;
        if (apiUrl)
            this.apiUrl = apiUrl;
        (async () => {
            this.modelsChat = await this.chatModels();
            this.modelsVisual = await this.visualModels();
        })()
    }

    public static hasVisual = (): boolean => { throw new Error("Method not implemented."); }

    abstract chatModels(): Promise<Record<string, Function> | undefined>;
    abstract chatRequest(groupId: number, model: string, input: string, historyMessages?: HistorySimpleJMsg[], useSystemRole?: boolean): Promise<any>;
    abstract visualModels(): Promise<Record<string, { chat: Function, tool: Function }> | undefined>;
    abstract visualRequest(groupId: number, model: string, nickName: string, j_msg: ComplexJMsg, historyMessages?: HistoryComplexJMsg[], useSystemRole?: boolean): Promise<any>;
    abstract toolRequest(model: string, j_msg: { img?: string[], text: string[] }): Promise<any>;
}
