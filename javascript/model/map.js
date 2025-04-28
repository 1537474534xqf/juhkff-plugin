/**
 * @file model/map.ts
 * @fileoverview: 聊天模型列表
 * @author: juhkff
 */
import { ArkEngine } from "./agent/instance/arkvolc.js";
import { DeepSeek } from "./agent/instance/deepseek.js";
import { Siliconflow } from "./agent/instance/siliconflow.js";
import { autoReplyConfig } from "../config/define/autoReply.js";
/**
 * 模型列表，新增的都加里面
 */
const agentMap = {
    siliconflow: Siliconflow,
    deepseek: DeepSeek,
    火山方舟: ArkEngine
};
let chatInstance = null;
let visualInstance = null;
(() => {
    if (autoReplyConfig.useAutoReply) {
        chatInstance = new agentMap[autoReplyConfig.chatApi]();
    }
    if (autoReplyConfig.useVisual) {
        visualInstance = new agentMap[autoReplyConfig.visualApi]();
    }
})();
const resetInstance = () => {
    if (autoReplyConfig.useAutoReply) {
        chatInstance = new agentMap[autoReplyConfig.chatApi]();
    }
    if (autoReplyConfig.useVisual) {
        visualInstance = new agentMap[autoReplyConfig.visualApi]();
    }
};
export { agentMap, chatInstance, visualInstance, resetInstance };
//# sourceMappingURL=map.js.map