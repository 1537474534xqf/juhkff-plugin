import { ChatAgent } from "../chatAgent";
export class Gemini extends ChatAgent {
    constructor(apiKey) { super(apiKey, "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"); }
    static hasVisual = () => false;
    chatRequest(model, input, historyMessages, useSystemRole) {
        throw new Error("Method not implemented.");
    }
    async chatModels() {
        throw new Error("Method not implemented.");
    }
    visualRequest(model, nickName, j_msg, historyMessages, useSystemRole) {
        throw new Error("Method not implemented.");
    }
    toolRequest(model, j_msg) {
        throw new Error("Method not implemented.");
    }
    visualModels() {
        throw new Error("Method not implemented.");
    }
}
