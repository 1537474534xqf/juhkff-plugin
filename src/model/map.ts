/**
 * @file model/map.ts
 * @fileoverview: 聊天模型列表
 * @author: juhkff
 */

import ArkEngine from "./agent/instance/arkvolc.js";
import DeepSeek from "./agent/instance/deepseek.js";
import Siliconflow from "./agent/instance/siliconflow.js";
import setting from "../model/setting.js"
import { AutoReply } from "../config/define/autoReply.js";
/**
 * 模型列表，新增的都加里面
 */
export const agentMap: Record<string, any> = {
    siliconflow: Siliconflow,
    deepseek: DeepSeek,
    火山方舟: ArkEngine
};

let ChatAgentInstance: ChatInterface | null = null;

if ((setting.getConfig("autoReply") as AutoReply).useAutoReply) {
    ChatAgentInstance = new agentMap[(setting.getConfig("autoReply") as AutoReply).chatApi]();
}

let VisualAgentInstance: VisualInterface | null = null;
if ((setting.getConfig("autoReply") as AutoReply).useVisual) {
    VisualAgentInstance = new agentMap[(setting.getConfig("autoReply") as AutoReply).visualApi]();
}

const resetInstance = () => {
    if ((setting.getConfig("autoReply") as AutoReply).useAutoReply) {
        ChatAgentInstance = new agentMap[(setting.getConfig("autoReply") as AutoReply).chatApi]();
    }
    if ((setting.getConfig("autoReply") as AutoReply).useVisual) {
        VisualAgentInstance = new agentMap[(setting.getConfig("autoReply") as AutoReply).visualApi]();
    }
}

export { ChatAgentInstance, VisualAgentInstance, resetInstance };