/**
 * @file model/map.ts
 * @fileoverview: 聊天模型列表
 * @author: juhkff
 */

import { ArkEngine } from "./agent/instance/arkvolc.js";
import { DeepSeek } from "./agent/instance/deepseek.js";
import { Siliconflow } from "./agent/instance/siliconflow.js";
import { autoReplyConfig } from "../config/define/autoReply.js";
import { ChatAgent } from "./agent/chatAgent.js";

/**
 * 模型列表，新增的都加里面
 */
const agentMap: Record<string, { new(...args: string[]): ChatAgent; hasVisual: () => boolean }> = {
    siliconflow: Siliconflow,
    deepseek: DeepSeek,
    火山方舟: ArkEngine
};

let chatInstance: ChatAgent | null = null;

let visualInstance: ChatAgent | null = null;

(() => {
    if (autoReplyConfig.useAutoReply) {
        chatInstance = new agentMap[autoReplyConfig.chatApi]();
    }
    if (autoReplyConfig.useVisual) {
        visualInstance = new agentMap[autoReplyConfig.visualApi]();
    }
})();

const reloadInstance = () => {
    if (autoReplyConfig.useAutoReply) {
        chatInstance = new agentMap[autoReplyConfig.chatApi]();
    }
    if (autoReplyConfig.useVisual) {
        visualInstance = new agentMap[autoReplyConfig.visualApi]();
    }
}


export { agentMap, chatInstance, visualInstance, reloadInstance }