/**
 * @file model/map.ts
 * @fileoverview: 聊天模型列表
 * @author: juhkff
 */
import { ArkEngine } from "./agent/instance/arkvolc.js";
import { DeepSeek } from "./agent/instance/deepseek.js";
import { Siliconflow } from "./agent/instance/siliconflow.js";
import { config } from "../config/index.js";
import { Gemini } from "./agent/instance/gemini.js";
// import { GeminiOpenAPI } from "./agent/instance/gemini-openapi.js";
/**
 * 模型列表，新增的都加里面
 */
const agentMap = {
    siliconflow: Siliconflow,
    deepseek: DeepSeek,
    火山方舟: ArkEngine,
    Gemini: Gemini,
    // "Gemini (OpenAPI)/适合国内使用": GeminiOpenAPI,
};
let chatInstance = null;
let visualInstance = null;
const agent = {
    get chat() {
        return chatInstance;
    },
    get visual() {
        return visualInstance;
    }
};
(() => {
    if (!config.autoReply.useAutoReply)
        return;
    chatInstance = new agentMap[config.autoReply.chatApi](config.autoReply.chatApiKey);
    if (config.autoReply.useVisual) {
        visualInstance = new agentMap[config.autoReply.visualApi](config.autoReply.visualApiKey);
    }
})();
const reloadInstance = () => {
    if (!config.autoReply.useAutoReply)
        return;
    chatInstance = new agentMap[config.autoReply.chatApi](config.autoReply.chatApiKey);
    if (config.autoReply.useVisual) {
        visualInstance = new agentMap[config.autoReply.visualApi](config.autoReply.visualApiKey);
    }
};
export { agentMap, agent, reloadInstance };
