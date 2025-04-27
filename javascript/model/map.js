/**
 * @file model/map.ts
 * @fileoverview: 聊天模型列表
 * @author: juhkff
 */
import ArkEngine from "./agent/instance/arkvolc.js";
import DeepSeek from "./agent/instance/deepseek.js";
import Siliconflow from "./agent/instance/siliconflow.js";
import setting from "../model/setting.js";
/**
 * 模型列表，新增的都加里面
 */
export const agentMap = {
    siliconflow: Siliconflow,
    deepseek: DeepSeek,
    火山方舟: ArkEngine
};
let ChatAgentInstance = null;
if (setting.getConfig("autoReply").useAutoReply) {
    ChatAgentInstance = new agentMap[setting.getConfig("autoReply").chatApi]();
}
let VisualAgentInstance = null;
if (setting.getConfig("autoReply").useVisual) {
    VisualAgentInstance = new agentMap[setting.getConfig("autoReply").visualApi]();
}
const resetInstance = () => {
    if (setting.getConfig("autoReply").useAutoReply) {
        ChatAgentInstance = new agentMap[setting.getConfig("autoReply").chatApi]();
    }
    if (setting.getConfig("autoReply").useVisual) {
        VisualAgentInstance = new agentMap[setting.getConfig("autoReply").visualApi]();
    }
};
export { ChatAgentInstance, VisualAgentInstance, resetInstance };
//# sourceMappingURL=map.js.map