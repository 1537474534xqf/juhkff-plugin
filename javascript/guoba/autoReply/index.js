import { appendIfShouldInputSelf, appendIfShouldInputSelfVisual, listAllChatApi, listAllVisualApi } from "./handler.js";
export const autoReplySchema = () => [
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
        bottomHelpMessage: "是否解析消息中包含的链接，确保chatApi生效时开启，可能会降低AI回复准确度",
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
        bottomHelpMessage: "当有人@BOT时，BOT是否回复。如果关闭，@BOT也会走概率回复",
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
        bottomHelpMessage: "若开启，会生成每日心情辅助生成群聊内容，由于意义不明，默认设为关闭",
        component: "Switch",
    },
    {
        field: "autoReply.emotionGenerateTime",
        label: "定时生成情感时间",
        bottomHelpMessage: "秒[0,59] 分钟[0,59] 小时[0,23] 日期[1,31] 月份[1,12] 星期[0,7/SUN,SAT]",
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
        field: "autoReply.debugMode",
        label: "调试模式",
        component: "Switch",
        bottomHelpMessage: "开启后，会输出请求内容日志，用于调试",
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
        bottomHelpMessage: "AI接口选择，如果开启解析URL，则该接口也会用于URL内容总结",
        component: "Select",
        componentProps: {
            options: listAllChatApi(),
        },
    },
    {
        field: "autoReply.chatApiKey",
        label: "群聊AI ApiKey",
        bottomHelpMessage: "填写AI接口和ApiKey、确保主动群聊开关开启后，务必先保存并刷新页面，否则模型无法选择！",
        component: "InputPassword",
    },
    {
        field: "autoReply.chatApiType",
        label: "群聊AI接口类型",
        bottomHelpMessage: "勾选视觉可支持图片识别。在勾选前请确保所选择的接口和模型支持相关功能",
        component: "CheckboxGroup",
        componentProps: {
            options: [
                {
                    label: "文本",
                    value: "text",
                    disabled: true,
                },
                {
                    label: "视觉",
                    value: "visual",
                },
            ],
        },
        defaultValue: ["text"],
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
        label: "说明",
        component: "InputTextArea",
        componentProps: {
            defaultValue: "如果群聊接口不支持视觉功能，或视觉功能让你不太满意，想用其它的视觉AI辅助处理时，可以开启该项\n" +
                "费用比较：\n" +
                "\t开启该视觉接口时，处理逻辑是识别聊天中的每个图片（先判断是否为表情包，若为否再判断图片内容），将解析的图片内容作为文字保存\n" +
                "\t如果主动群聊调用频繁且开启上下文条数较大 —— 关闭该接口时，群聊中的一张图片会被原聊天接口（支持视觉）多次携带进行请求；启用该接口时，群聊中的一张图片仅会进行一次解析，之后就作为文字内容保存在上下文和进行调用接口\n" +
                "\t如果主动群聊调用概率较低 —— 关闭该接口时，群聊中的一张图片仅会在进行请求时携带发送；启用该接口时，群聊中的每张图片都会被该视觉接口进行两次调用（表情包判断+内容判断），即使其可能之后不会用到，这样会消耗更多费用\n" +
                "\t综上，请根据实际使用情景进行选择。个人感觉除非原接口不支持视觉处理，从省钱的角度考虑大多情况下还是关闭该项比较好",
            readonly: true,
            disabled: true,
            rows: 10,
        }
    },
    {
        field: "autoReply.useVisual",
        label: "是否使用视觉AI接口",
        bottomHelpMessage: "开启此选项可对图片进行识别并应用于上下文记忆，开启时请将原视觉接口视为纯文本接口",
        component: "Switch",
    },
    {
        field: "autoReply.visualApi",
        label: "视觉AI接口选择",
        component: "Select",
        componentProps: {
            options: listAllVisualApi(),
        },
        bottomHelpMessage: "由于可能会调用频繁，此处不建议使用 Gemini 等速率较慢或调用次数受限的接口，若要使用 Gemini 等，推荐采用在上面的 群聊AI接口类型 中添加视觉类型的形式"
    },
    {
        field: "autoReply.visualApiKey",
        label: "视觉AI ApiKey",
        bottomHelpMessage: "填写AI接口和ApiKey、确保视觉AI接口开启后，务必先保存并刷新页面，否则模型无法选择！",
        component: "InputPassword",
    },
    ...appendIfShouldInputSelfVisual(),
];
//# sourceMappingURL=index.js.map