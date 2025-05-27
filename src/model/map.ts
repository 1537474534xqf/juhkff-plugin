/**
 * @file model/map.ts
 * @fileoverview: 聊天模型列表
 * @author: juhkff
 */

import { ArkEngine } from "./agent/instance/arkvolc.js";
import { DeepSeek } from "./agent/instance/deepseek.js";
import { Siliconflow } from "./agent/instance/siliconflow.js";
import { ChatAgent } from "./agent/chatAgent.js";
import { config } from "../config/index.js";
import { Gemini } from "./agent/instance/gemini.js";
import { GeminiOpenAPI } from "./agent/instance/gemini-openapi.js";
import { OpenAI } from "./agent/openaiAgent.js";
import { OpenRouter } from "./agent/instance/openrouter.js";
import { eventBus } from "../cache/global.js";
import { EVENT_RELOAD_INSTANCE } from "./constant.js";

/**
 * 模型列表，新增的都加里面
 */
const agentMap: Record<string, { new(...args: any[]): ChatAgent; hasVisual: () => boolean }> = {
    siliconflow: Siliconflow,
    deepseek: DeepSeek,
    火山方舟: ArkEngine,
    Gemini: Gemini,
    "Gemini-OpenAPI（国内中转）": GeminiOpenAPI,
    OpenRouter: OpenRouter,
    OpenAI通用: OpenAI,
};

let chatInstance: ChatAgent | null = null;

let visualInstance: ChatAgent | null = null;

const agent = {
    get chat() {
        return chatInstance;
    },
    get visual() {
        return visualInstance;
    }
};

(() => {
    if (!config.autoReply.useAutoReply) return;
    chatInstance = new agentMap[config.autoReply.chatApi](config.autoReply.chatApiKey);
    if (config.autoReply.useVisual) {
        visualInstance = new agentMap[config.autoReply.visualApi](config.autoReply.visualApiKey);
    }
})();

eventBus.on(EVENT_RELOAD_INSTANCE, () => {
    if (!config.autoReply.useAutoReply) return;
    chatInstance = new agentMap[config.autoReply.chatApi](config.autoReply.chatApiKey);
    if (config.autoReply.useVisual) visualInstance = new agentMap[config.autoReply.visualApi](config.autoReply.visualApiKey);
});

export { agentMap, agent }