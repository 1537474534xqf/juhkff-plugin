export class ChatAgent {
    proxy = null;
    apiKey;
    apiUrl = undefined;
    modelsChat = {};
    modelsVisual = {};
    constructor(apiKey, apiUrl = null) {
        this.apiKey = apiKey;
        if (apiUrl)
            this.apiUrl = apiUrl;
        (async () => {
            this.modelsChat = await this.chatModels();
            this.modelsVisual = await this.visualModels();
        })();
    }
    static hasVisual = () => { throw new Error("Method not implemented."); };
}
//# sourceMappingURL=chatAgent.js.map