/**
 * @file chatApi.js
 * @fileoverview 聊天接口定义和公用函数
 * @author juhkff
 */

import setting from "#juhkff.setting";
import { EMOTION_KEY } from "#juhkff.redis";
import { Objects } from "#juhkff.kits";

export const ChatInterface = {
    generateRequest: Symbol("generateRequest"),
    getModelMap: Symbol("getModelMap"),
};

/**
 *
 * @param {*} apiKey apiKey
 * @param {*} model 使用的API模型
 * @param {*} input 当前聊天输入
 * @param {*} historyMessages 聊天历史记录
 * @param {*} image_list 图片列表
 * @param {*} image_type 是否可传入图片
 */
ChatInterface.generateRequest = async function ({
    apiKey,
    model,
    input,
    historyMessages = [],
    image_list = {},
    image_type = false,
    useSystemRole = true
}) { };

ChatInterface.getModelMap = function () { };

export class ChatApi {
    constructor() {
        this.Config = setting.getConfig("autoReply");
        this.ModelMap = {};
        this.ApiBaseUrl = undefined;
        // 默认情况下模型等信息在指定API后提供，禁止用户自行输入
        this.shouldInputSelf = false;
    }

    [ChatInterface.getModelMap]() { }

    async [ChatInterface.generateRequest]({
        apiKey,
        model,
        input,
        historyMessages = [],
        image_list = {},
        image_type = false,
        useSystemRole = true
    }) { }
}

/************************** 函数调用 **************************/

/**
 * 生成 role = system 的内容
 * @param {*} useEmotion 是否使用情感
 * @param {*} chatPrompt 聊天预设
 * @returns `{role: 'system', content: 'xxx'}`
 */
export async function generateSystemContent(useEmotion, chatPrompt) {
    if (Objects.isNull(chatPrompt))
        chatPrompt =
            "You are a helpful assistant, you must speak Chinese. Now you are in a chat group, and the following is chat history";
    var emotionPrompt = await redis.get(EMOTION_KEY);
    return {
        role: "system",
        // todo 按deepseek-r1的模板修正格式，之后有问题再说
        content: useEmotion
            ? `${chatPrompt} \n 你的情感倾向——${emotionPrompt
                .replace(/\n/g, "")
                .replace(/\s+/g, "")}`
            : chatPrompt,
    };
}
