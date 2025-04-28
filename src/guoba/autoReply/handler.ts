import setting from "../../model/setting.js"
/**
 * 获取群聊AI模型
 * @returns 群聊AI模型列表
 */
function getChatModels() {
    var chatApi = setting.getConfig("autoReply").chatApi;
    var chatInstance = chatMap[chatApi];
    if (!chatInstance) return [];
    var result = [];
    for (const key of Object.keys(chatInstance.ModelMap)) {
        result.push({ label: key, value: key });
    }
    return result;
}

function getVisualModels() {
    var visualApi = setting.getConfig("autoReply").visualApi;
    var chatInstance = visualMap[visualApi];
    if (!chatInstance) return [];
    var result = [];
    for (const key of Object.keys(chatInstance.ModelMap)) {
        result.push({ label: key, value: key });
    }
    return result;
}

/**
 * 获取群聊AI接口列表
 * @returns 群聊AI接口列表
 */
function listAllChatApi() {
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
function listAllVisualApi() {
    var visualKeys = Object.keys(visualMap);
    var result = [];
    for (const key of visualKeys) {
        result.push({ label: key, value: key });
    }
    return result;
}

function appendIfShouldInputSelf() {
    var chatApi = setting.getConfig("autoReply").chatApi;
    var chatInstance = chatMap[chatApi];
    if (chatInstance?.shouldInputSelf) {
        var subSchemas = [
            {
                field: "autoReply.chatModel",
                label: "群聊AI模型",
                bottomHelpMessage: "确保开关开启，保存并刷新页面后，再选择或填写该项！",
                component: "Input",
            },
            {
                field: "autoReply.apiCustomUrl",
                label: "模型请求URL",
                bottomHelpMessage: "格式一般以http(s)开头，以/chat/completions结尾",
                component: "Input",
            },
        ];
    } else {
        var subSchemas = [
            {
                field: "autoReply.chatModel",
                label: "群聊AI模型",
                bottomHelpMessage: "确保开关开启，保存并刷新页面后，再选择或填写该项！",
                component: "Select",
                componentProps: {
                    options: getChatModels(),
                },
            },
        ];
    }
    return subSchemas;
}

function appendIfShouldInputSelfVisual() {
    var visualApi = setting.getConfig("autoReply").visualApi;
    var chatInstance = visualMap[visualApi];
    if (chatInstance?.shouldInputSelf) {
        var subSchemas = [
            {
                field: "autoReply.visualModel",
                label: "视觉AI模型",
                bottomHelpMessage: "确保开关开启，保存并刷新页面后，再选择或填写该项！",
                component: "Input",
            },
            {
                field: "autoReply.visualApiCustomUrl",
                label: "视觉模型请求URL",
                component: "Input",
            },
        ];
    } else {
        var subSchemas = [
            {
                field: "autoReply.visualModel",
                label: "视觉AI模型",
                bottomHelpMessage: "确保开关开启，保存并刷新页面后，再选择或填写该项！",
                component: "Select",
                componentProps: {
                    options: getVisualModels(),
                },
            },
        ];
    }
    return subSchemas;
}
