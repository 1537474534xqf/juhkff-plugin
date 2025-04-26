interface ChatInterface {
    chatRequest(apiKey: string, model: string, input: string, historyMessages?: any[], useSystemRole?: boolean): Promise<any>;
    chatModels(): Promise<Record<string, any> | null>;
}

interface VisualInterface {
    visualRequest(apiKey: string, model: string, nickName: string, j_msg: any, historyMessages?: any[], useSystemRole?: boolean): Promise<any>;
    toolRequest(apiKey: string, model: string, j_msg: any): Promise<any>;
    visualModels(): Promise<Record<string, any> | null>;
}