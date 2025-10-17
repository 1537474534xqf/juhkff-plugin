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
import { GeminiOpenAI } from "./agent/instance/gemini-openai.js";
import { OpenAI } from "./agent/openaiAgent.js";
import { OpenRouter } from "./agent/instance/openrouter.js";
import { GPTGod } from "./agent/instance/gptgod.js";
import { EVENT_RELOAD_INSTANCE } from "./constant.js";
import { HttpsProxyAgent } from "https-proxy-agent";

/**
 * 模型列表，新增的都加里面
 */
const agentMap: Record<string, { new(...args: any[]): ChatAgent; hasVisual: () => boolean }> = {
    siliconflow: Siliconflow,
    deepseek: DeepSeek,
    火山方舟: ArkEngine,
    Gemini: Gemini,
    "Gemini-OpenAI（国内中转）": GeminiOpenAI,
    OpenRouter: OpenRouter,
    GPTGod: GPTGod,
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
    if (config.autoReply.useAutoReply) {
        chatInstance = new agentMap[config.autoReply.chatApi](config.autoReply.chatApiKey);
        if (config.autoReply.useChatProxy && config.autoReply.chatProxyUrl.trim()) chatInstance.proxy = new HttpsProxyAgent(config.autoReply.chatProxyUrl);
        if (config.autoReply.useVisual) {
            visualInstance = new agentMap[config.autoReply.visualApi](config.autoReply.visualApiKey);
            if (config.autoReply.useVisualProxy && config.autoReply.visualProxyUrl.trim()) visualInstance.proxy = new HttpsProxyAgent(config.autoReply.visualProxyUrl);
        }
    }
})();

Bot.on(EVENT_RELOAD_INSTANCE, () => {
    if (config.autoReply.useAutoReply) {
        chatInstance = new agentMap[config.autoReply.chatApi](config.autoReply.chatApiKey);
        if (config.autoReply.useChatProxy && config.autoReply.chatProxyUrl.trim()) chatInstance.proxy = new HttpsProxyAgent(config.autoReply.chatProxyUrl);
        if (config.autoReply.useVisual) {
            visualInstance = new agentMap[config.autoReply.visualApi](config.autoReply.visualApiKey);
            if (config.autoReply.useVisualProxy && config.autoReply.visualProxyUrl.trim()) visualInstance.proxy = new HttpsProxyAgent(config.autoReply.visualProxyUrl);
        }
    }
});

export { agentMap, agent }