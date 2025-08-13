export const helpGenSchema = () => [
    {
        label: "帮助图片",
        // 第一个分组标记开始，无需标记结束
        component: "SOFT_GROUP_BEGIN",
    },
    {
        field: "helpGen.useHelpGen",
        label: "开启帮助",
        bottomHelpMessage: "开启后，可生成帮助图片",
        component: "Switch",
    },
    {
        field: "helpGen.command",
        label: "命令",
        bottomHelpMessage: "机器人收到`#命令`会回复帮助图片，修改此项后需重启机器人",
        component: "Input",
    },
    {
        field: "helpGen.titleZh",
        label: "标题",
        bottomHelpMessage: "一般写图片的中文标题，为空则取命令为标题",
        component: "Input",
    },
    {
        field: "helpGen.titleEn",
        label: "小标题",
        bottomHelpMessage: "一般写图片的英文标题，为空则取内置默认值",
        component: "Input",
    },
    {
        field: "helpGen.hd",
        label: "高清模式",
        bottomHelpMessage: "图片质量更好，生成速度更慢，可能占用更多机器资源",
        component: "Switch",
    },
    {
        field: "helpGen.colorOptions",
        label: "字体颜色",
        bottomHelpMessage: "自定义字体颜色",
        component: "GSubForm",
        componentProps: {
            modalProps: {
                title: "自定义各区域字体颜色"
            },
            style: {
                maxHeight: '100px', // 设置最大高度
                overflowY: 'auto', // 添加垂直滚动条
            },
            schemas: [
                {
                    field: "titleColor",
                    label: "标题颜色",
                    component: "GColorPicker",
                    bottomHelpMessage: "默认值 rgba(255, 255, 255, 1)，无法隐藏",
                    componentProps: {
                        defaultValue: "rgba(255, 255, 255, 1)",
                    },
                },
                {
                    field: "labelColor",
                    label: "小标题颜色",
                    component: "GColorPicker",
                    bottomHelpMessage: "默认值 rgba(255, 255, 255, 1)，无法隐藏",
                    componentProps: {
                        defaultValue: "rgba(255, 255, 255, 1)",
                    },
                },
                {
                    field: "copyrightColor",
                    label: "copyRight颜色",
                    component: "GColorPicker",
                    bottomHelpMessage: "默认值 rgba(255, 255, 255, 1)，无法隐藏",
                    componentProps: {
                        defaultValue: "rgba(255, 255, 255, 1)",
                    },
                },
                {
                    field: "groupColor",
                    label: "功能组颜色",
                    component: "GColorPicker",
                    bottomHelpMessage: "默认值 rgba(206, 183, 139, 1)",
                    componentProps: {
                        defaultValue: "rgba(206, 183, 139, 1)",
                    },
                },
                {
                    field: "groupTitleColor",
                    label: "功能组命令颜色",
                    component: "GColorPicker",
                    bottomHelpMessage: "默认值 rgba(240, 197, 43, 1)",
                    componentProps: {
                        defaultValue: "rgba(240, 197, 43, 1)",
                    },
                },
                {
                    field: "groupDescColor",
                    label: "功能组描述颜色",
                    component: "GColorPicker",
                    bottomHelpMessage: "默认值 rgba(243, 182, 109, 1)",
                    componentProps: {
                        defaultValue: "rgba(243, 182, 109, 1)",
                    },
                },
                {
                    field: "helpNameColor",
                    label: "帮助名称颜色",
                    component: "GColorPicker",
                    bottomHelpMessage: "默认值 rgba(111, 186, 243, 0.946)",
                    componentProps: {
                        defaultValue: "rgba(111, 186, 243, 0.946)",
                    },
                },
                {
                    field: "helpTitleColor",
                    label: "帮助命令颜色",
                    component: "GColorPicker",
                    bottomHelpMessage: "默认值 rgba(240, 197, 43, 1)",
                    componentProps: {
                        defaultValue: "rgba(240, 197, 43, 1)",
                    },
                },
                {
                    field: "helpDescColor",
                    label: "帮助描述颜色",
                    component: "GColorPicker",
                    bottomHelpMessage: "默认值 rgba(255, 255, 255, 1)",
                    componentProps: {
                        defaultValue: "rgba(255, 255, 255, 1)",
                    },
                },
            ],
        }
    },
    {
        field: "helpGen.manualList",
        label: "其它命令",
        bottomHelpMessage: "你可以在这添加其它插件的功能，帮助图片也会生成相应内容",
        component: "GSubForm",
        componentProps: {
            multiple: true,
            schemas: [
                {
                    field: "name",
                    label: "命令/功能名称",
                    bottomHelpMessage: "给你的功能起个名。为功能组时必填",
                    component: "Input",
                },
                {
                    field: "type",
                    label: "功能类型",
                    bottomHelpMessage: "主动式：指令主动触发；被动式：满足条件时自动触发；功能组：内含多个功能，例如`豆包AI`包含`图片生成`、`视频生成`多个子功能；子功能：属于某个功能组",
                    component: "Select",
                    required: true,
                    componentProps: {
                        options: [
                            {
                                label: "主动式",
                                value: "active",
                            },
                            {
                                label: "被动式",
                                value: "passive",
                            },
                            {
                                label: "功能组",
                                value: "group",
                            },
                            {
                                label: "子功能",
                                value: "sub",
                            }
                        ],
                    },
                },
                {
                    field: "command",
                    label: "调用格式",
                    bottomHelpMessage: "需包含#等前缀。一般来说被动式命令不需要填这项，但也可以填",
                    component: "Input",
                },
                {
                    field: "dsc",
                    label: "功能描述",
                    component: "Input",
                },
                {
                    field: "belongTo",
                    label: "所属功能组",
                    bottomHelpMessage: "类型为子功能时必填，并确保和已有的功能组名一致。其它类型时忽略此项",
                    component: "Input",
                }
            ],
        },
    }
];
