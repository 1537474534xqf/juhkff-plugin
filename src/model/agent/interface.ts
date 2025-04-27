interface ChatInterface {
    chatRequest(model: string, input: string, historyMessages?: any[], useSystemRole?: boolean): Promise<any>;
    chatModels(): Promise<Record<string, any> | null>;
}

interface VisualInterface {
    visualRequest(model: string, nickName: string, j_msg: any, historyMessages?: any[], useSystemRole?: boolean): Promise<any>;
    toolRequest(model: string, j_msg: any): Promise<any>;
    visualModels(): Promise<Record<string, any> | null>;
}