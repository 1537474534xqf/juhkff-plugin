import { ChatApiType } from "../../config/define/autoReply.js";
import { config } from "../../config/index.js";
import { agentMap, agent } from "../../model/map.js";
import { Objects } from "../../utils/kits.js";
/**
 * 获取群聊AI模型
 * @returns 群聊AI模型列表
 */
function getChatModels() {
    if (!agent.chat)
        return [];
    var result = [];
    if (config.autoReply.chatApiType.includes(ChatApiType.VISUAL)) {
        for (const key of Object.keys(agent.chat.modelsVisual))
            result.push({ label: key, value: key });
    }
    else {
        for (const key of Object.keys(agent.chat.modelsChat))
            result.push({ label: key, value: key });
    }
    return result;
}
function getVisualModels() {
    if (!agent.visual)
        return [];
    var result = [];
    for (const key of Object.keys(agent.visual.modelsVisual)) {
        result.push({ label: key, value: key });
    }
    return result;
}
/**
 * 获取群聊AI接口列表
 * @returns 群聊AI接口列表
 */
export function listAllChatApi() {
    var chatKeys = Object.keys(agentMap);
    var result = [];
    for (const key of chatKeys) {
        result.push({ label: key, value: key });
    }
    return result;
}
/**
 * 获取视觉AI接口列表
 * @returns 视觉AI接口列表
 */
export function listAllVisualApi() {
    var visualKeys = Object.entries(agentMap)
        .filter(([_, AgentClass]) => AgentClass.hasVisual())
        .map(([key]) => key);
    var result = [];
    for (const key of visualKeys) {
        result.push({ label: key, value: key });
    }
    return result;
}
export function appendIfShouldInputSelf() {
    let schemas = [];
    if (!agent.chat)
        return schemas;
    if (Objects.isNull(agent.chat.apiUrl)) {
        const chatModelInput = {
            field: "autoReply.chatModel",
            label: "群聊AI模型",
            bottomHelpMessage: "确保开关开启，保存并刷新页面后，再选择或填写该项！",
            component: "AutoComplete",
            componentProps: {
                options: getChatModels(),
            },
        };
        const chatApiCustomUrl = {
            field: "autoReply.apiCustomUrl",
            label: "模型请求URL",
            bottomHelpMessage: "格式一般以http(s)开头，以/chat/completions结尾",
            component: "Input",
        };
        schemas = [chatModelInput, chatApiCustomUrl];
    }
    else {
        const chatModelSelect = {
            field: "autoReply.chatModel",
            label: "群聊AI模型",
            bottomHelpMessage: "确保开关开启，保存并刷新页面后，再选择或填写该项！",
            component: "AutoComplete",
            componentProps: {
                options: getChatModels(),
            },
        };
        schemas = [chatModelSelect];
    }
    return schemas;
}
;
export function appendIfShouldInputSelfVisual() {
    let schemas = [];
    if (!agent.visual)
        return schemas;
    if (!agent.visual.apiUrl) {
        schemas = [
            {
                field: "autoReply.visualModel",
                label: "视觉AI模型",
                bottomHelpMessage: "确保开关开启，保存并刷新页面后，再选择或填写该项！",
                component: "AutoComplete",
                componentProps: {
                    options: getVisualModels(),
                },
            },
            {
                field: "autoReply.visualApiCustomUrl",
                label: "视觉模型请求URL",
                bottomHelpMessage: "格式一般以http(s)开头，以/chat/completions结尾",
                component: "Input",
            },
        ];
    }
    else {
        schemas = [
            {
                field: "autoReply.visualModel",
                label: "视觉AI模型",
                bottomHelpMessage: "确保开关开启，保存并刷新页面后，再选择或填写该项！",
                component: "AutoComplete",
                componentProps: {
                    options: getVisualModels(),
                },
            },
        ];
    }
    return schemas;
}
