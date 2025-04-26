/**
 * @file model/map.ts
 * @fileoverview: 聊天模型列表
 * @author: juhkff
 */

import ArkEngine from "./agent/instance/arkvolc";
import DeepSeek from "./agent/instance/deepseek";
import Siliconflow from "./agent/instance/siliconflow";

/**
 * 模型列表，新增的都加里面
 */
export const agentMap = {
    siliconflow: Siliconflow,
    deepseek: DeepSeek,
    "火山方舟": ArkEngine
};