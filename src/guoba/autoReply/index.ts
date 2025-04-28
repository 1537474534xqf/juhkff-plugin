import { appendIfShouldInputSelf, appendIfShouldInputSelfVisual, listAllChatApi, listAllVisualApi } from "./handler.js"

export const autoReplySchema = [
    {
        label: "群聊配置",
        // 第一个分组标记开始，无需标记结束
        component: "SOFT_GROUP_BEGIN",
    },
    {
        field: "autoReply.useAutoReply",
        label: "主动群聊开关",
        bottomHelpMessage: "若开启，BOT会根据概率和设定主动回复群聊",
        component: "Switch",
    },
    {
        field: "autoReply.attachUrlAnalysis",
        label: "是否解析URL",
        bottomHelpMessage:
            "是否解析消息中包含的链接，确保chatApi生效时开启，可能会降低AI回复准确度",
        component: "Switch",
    },
    {
        field: "autoReply.useContext",
        label: "是否使用上下文",
        bottomHelpMessage: "是否保存群聊历史对话",
        component: "Switch",
    },
    {
        field: "autoReply.maxHistoryLength",
        label: "上下文长度",
        bottomHelpMessage: "存储历史对话的长度",
        component: "InputNumber",
        componentProps: {
            min: 1,
            step: 1,
        },
    },
    {
        field: "autoReply.defaultChatRate",
        label: "主动回复概率",
        bottomHelpMessage: "概率小数[0,1]，越高越容易触发主动回复",
        component: "InputNumber",
        componentProps: {
            min: 0,
            max: 1,
            step: 0.01,
        },
        required: true,
    },
    {
        field: "autoReply.defaultReplyAtBot",
        label: "@BOT时回复",
        bottomHelpMessage:
            "当有人@BOT时，BOT是否回复。如果关闭，@BOT也会走概率回复",
        component: "Switch",
        required: true,
    },
    {
        field: "autoReply.groupChatRate",
        label: "特定群设置",
        bottomHelpMessage: "该项优先于默认设置",
        component: "GSubForm",
        componentProps: {
            multiple: true,
            schemas: [
                {
                    field: "groupList",
                    label: "群号",
                    required: true,
                    bottomHelpMessage: "群号",
                    component: "GSelectGroup",
                },
                {
                    field: "chatRate",
                    label: "主动回复概率",
                    component: "InputNumber",
                    componentProps: {
                        min: 0,
                        max: 1,
                        step: 0.01,
                    },
                    required: true,
                },
                {
                    field: "replyAtBot",
                    label: "@BOT时回复",
                    component: "Switch",
                    componentProps: {
                        defaultChecked: true,
                    },
                    bottomHelpMessage: "不管是还是否，都要点一下才能提交",
                    required: true,
                },
            ],
        },
    },
    {
        field: "autoReply.chatPrompt",
        label: "群聊预设",
        bottomHelpMessage: "定义BOT的人设或信息处理的基本逻辑",
        component: "InputTextArea",
        componentProps: {
            placeholder: "请输入群聊预设",
            rows: 6,
        },
    },
    {
        field: "autoReply.useEmotion",
        label: "BOT情感开关",
        bottomHelpMessage:
            "若开启，会生成每日心情辅助生成群聊内容，由于意义不明，默认设为关闭",
        component: "Switch",
    },
    {
        field: "autoReply.emotionGenerateTime",
        label: "定时生成情感时间",
        bottomHelpMessage:
            "秒[0,59] 分钟[0,59] 小时[0,23] 日期[1,31] 月份[1,12] 星期[0,7/SUN,SAT]",
        component: "EasyCron",
        componentProps: {
            placeholder: "*表示任意，?表示不指定（月日和星期互斥）",
        },
    },
    {
        field: "autoReply.emotionGeneratePrompt",
        label: "情感生成预设",
        bottomHelpMessage: "BOT的每日心情生成所使用的预设",
        component: "InputTextArea",
        componentProps: {
            placeholder: "请输入心情预设",
            rows: 3,
        },
    },
    {
        component: "Divider",
        label: "常规接口配置",
        componentProps: {
            type: "horizontal",
            style: {
                fontWeight: "bold",
                color: "rgb(76, 113, 201)",
                fontSize: "16px",
            },
            // 前端写死了，这里写啥其实都没用
            orientation: "left",
            plain: true,
        },
    },
    {
        field: "autoReply.chatApi",
        label: "群聊AI接口选择",
        bottomHelpMessage:
            "AI接口选择，如果开启解析URL，则该接口也会用于URL内容总结",
        component: "Select",
        componentProps: {
            options: listAllChatApi(),
        },
    },
    {
        field: "autoReply.chatApiKey",
        label: "群聊AI ApiKey",
        bottomHelpMessage:
            "填写AI接口和ApiKey、确保主动群聊开关开启后，务必先保存并刷新页面，否则模型无法选择！",
        component: "InputPassword",
    },
    ...appendIfShouldInputSelf(),
    {
        component: "Divider",
        label: "视觉接口配置",
        componentProps: {
            type: "horizontal",
            style: {
                fontWeight: "bold",
                color: "rgb(76, 113, 201)",
                fontSize: "16px",
            },
            orientation: "left",
            plain: true,
        },
    },
    {
        field: "autoReply.useVisual",
        label: "是否使用视觉AI接口",
        bottomHelpMessage: "开启此选项可对图片进行识别并应用于上下文记忆",
        component: "Switch",
    },
    {
        field: "autoReply.visualReplaceChat",
        label: "视觉AI替代群聊AI",
        bottomHelpMessage:
            "开启此选项，视觉AI将替代群聊AI，常规接口配置将失效；关闭此选项（并开启视觉AI接口），视觉AI仅会将图片转文本存入上下文。群聊AI准确度高于视觉AI时可关闭该项。切换此选项会清空已经记录的上下文",
        component: "Switch",
    },
    {
        field: "autoReply.visualApi",
        label: "视觉AI接口选择",
        bottomHelpMessage: "可选项：siliconflow",
        component: "Select",
        componentProps: {
            options: listAllVisualApi(),
        },
    },
    {
        field: "autoReply.visualApiKey",
        label: "视觉AI ApiKey",
        bottomHelpMessage:
            "填写AI接口和ApiKey、确保视觉AI接口开启后，务必先保存并刷新页面，否则模型无法选择！",
        component: "InputPassword",
    },
    ...appendIfShouldInputSelfVisual(),
]
