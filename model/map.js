/**
 * @file model/mapStore.js
 * @fileoverview: 聊天模型列表
 * @author: juhkff
 */

import Siliconflow from "./chat/instance/siliconflow.js";
import DeepSeek from "./chat/instance/deepseek.js";
import ArkEngine from "./chat/instance/arkvolc.js";

/**
 * 聊天模型列表，新增的都加里面
 */
export  const chatMap = {
    siliconflow: Siliconflow,
    deepseek: DeepSeek,
    "火山方舟": ArkEngine
};