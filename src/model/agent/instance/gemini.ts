import { ChatAgent } from "../chatAgent";

export class Gemini extends ChatAgent {
    constructor(apiKey: string) { super(apiKey, "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"); }
    static hasVisual = () => false;
    chatRequest(model: string, input: string, historyMessages?: any[], useSystemRole?: boolean): Promise<any> {
        throw new Error("Method not implemented.");
    }
    async chatModels(): Promise<Record<string, Function> | undefined> {
        throw new Error("Method not implemented.");
    }
    visualRequest(model: string, nickName: string, j_msg: any, historyMessages?: any[], useSystemRole?: boolean): Promise<any> {
        throw new Error("Method not implemented.");
    }
    toolRequest(model: string, j_msg: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    visualModels(): Promise<Record<string, { chat: Function; tool: Function; }> | undefined> {
        throw new Error("Method not implemented.");
    }
}