export const emojiSaveSchema = () => [
    {
        label: "偷图配置",
        // 第三个分组标记开始
        component: "SOFT_GROUP_BEGIN",
    },
    {
        field: "emojiSave.useEmojiSave",
        label: "偷图功能开关",
        bottomHelpMessage: "若开启，BOT会根据配置偷表情和发表情",
        component: "Switch",
    },
    {
        field: "emojiSave.defaultReplyRate",
        label: "默认回复表情概率",
        bottomHelpMessage: "默认回复表情概率",
        component: "InputNumber",
        componentProps: {
            min: 0,
            max: 1,
            step: 0.01,
        },
        required: true,
    },
    {
        field: "emojiSave.defaultEmojiRate",
        label: "默认发送偷图概率",
        bottomHelpMessage: "低于此概率发送偷图配置，高于此概率发送本地图库（若其中一种为空则固定发送另一种）。只发送本地图库可置为0，只发送偷图可置为1",
        component: "InputNumber",
        componentProps: {
            min: 0,
            max: 1,
            step: 0.01,
        },
        required: true,
    },
    {
        field: "emojiSave.emojiGalleryPath",
        label: "本地图库路径",
        bottomHelpMessage: "相对 juhkff-plugin 目录的路径，支持 / 和 \\\\ 分隔符；请确保其为专用于图库的目录路径，且目录下仅包含图片文件",
        component: "Input",
        componentProps: {
            placeholder: "./data/emojiGallery",
        },
    },
    {
        field: "emojiSave.expireTimeInSeconds",
        label: "表情确认时间（秒）",
        bottomHelpMessage:
            "只有发送两次相同图片时，会被记为表情并偷取，默认259200为3天",
        component: "InputNumber",
        componentProps: {
            min: 1,
            step: 1,
        },
        required: true,
    },
    {
        field: "emojiSave.groupRate",
        label: "特定群偷图配置",
        bottomHelpMessage: "该项优先于默认概率",
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
                    field: "replyRate",
                    label: "回复表情概率",
                    component: "InputNumber",
                    componentProps: {
                        min: 0,
                        max: 1,
                        step: 0.01,
                    },
                    required: true,
                },
                {
                    field: "emojiRate",
                    label: "发送偷图概率",
                    component: "InputNumber",
                    componentProps: {
                        min: 0,
                        max: 1,
                        step: 0.01,
                    },
                    required: true,
                },
            ],
        },
    },
]