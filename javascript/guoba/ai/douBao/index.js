export const douBaoSchema = () => [
    {
        label: "豆包",
        // 第四个分组标记开始
        component: "SOFT_GROUP_BEGIN",
    },
    {
        field: "douBao.useDouBao",
        label: "豆包开关",
        bottomHelpMessage: "启用豆包相关功能，可使用`#豆包`命令查询可用指令",
        component: "Switch",
    },
    {
        component: "Divider",
        label: "视频生成",
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
        field: "douBao.useVideoGenerate",
        label: "视频生成开关",
        component: "Switch",
    },
    {
        field: "douBao.videoGenerate",
        label: "配置",
        component: "GSubForm",
        componentProps: {
            modalProps: {
                title: "视频生成配置"
            },
            style: {
                maxHeight: '100px', // 设置最大高度
                overflowY: 'auto' // 添加垂直滚动条
            },
            schemas: [
                {
                    field: "apiKey",
                    label: "ApiKey",
                    bottomHelpMessage: "官网: https://console.volcengine.com/ark/",
                    component: "Input",
                },
                {
                    field: "url",
                    label: "视频生成URL",
                    bottomHelpMessage: "视频生成请求URL，官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "model",
                    label: "视频生成模型",
                    bottomHelpMessage: "官网文档模型ID: https://www.volcengine.com/docs/82379/1330310",
                    component: "Input",
                },
            ]
        },
    },
    {
        component: "Divider",
        label: "图片服务配置",
        componentProps: {
            type: "horizontal",
            style: {
                fontWeight: "bold",
                color: "rgb(66, 162, 125)",
                fontSize: "16px",
            },
            orientation: "left",
            plain: true,
        },
    },
    {
        field: "douBao.imageService",
        label: "配置",
        bottomHelpMessage: "用于下面同色服务",
        component: "GSubForm",
        componentProps: {
            style: {
                maxHeight: '100px', // 设置最大高度
                overflowY: 'auto' // 添加垂直滚动条
            },
            schemas: [
                {
                    field: "accessKeyId",
                    label: "AccessKeyId",
                    bottomHelpMessage: "必填！官网密钥: https://console.volcengine.com/iam/keymanage",
                    component: "InputPassword",
                },
                {
                    field: "secretAccessKey",
                    label: "SecretAccessKey",
                    bottomHelpMessage: "必填！官网密钥: https://console.volcengine.com/iam/keymanage",
                    component: "InputPassword",
                },
                {
                    field: "host",
                    label: "服务Host",
                    bottomHelpMessage: "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "region",
                    label: "服务Region",
                    bottomHelpMessage: "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "service",
                    label: "服务名称",
                    bottomHelpMessage: "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "action",
                    label: "服务Action",
                    bottomHelpMessage: "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "version",
                    label: "服务Version",
                    bottomHelpMessage: "官方没有变动就不需要改默认值",
                    component: "Input",
                },
            ]
        }
    },
    {
        component: "Divider",
        label: "图片生成",
        componentProps: {
            type: "horizontal",
            style: {
                fontWeight: "bold",
                color: "rgb(66, 162, 125)",
                fontSize: "16px",
            },
            orientation: "left",
            plain: true,
        },
    },
    {
        field: "douBao.useImageGenerate",
        label: "开关",
        component: "Switch",
    },
    {
        field: "douBao.imageGenerate",
        label: "配置",
        component: "GSubForm",
        componentProps: {
            modalProps: {
                title: "图片生成配置"
            },
            style: {
                maxHeight: '100px', // 设置最大高度
                overflowY: 'auto' // 添加垂直滚动条
            },
            schemas: [
                {
                    component: "Divider",
                    label: "文生图",
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
                    field: "reqKey",
                    label: "文生图算法",
                    bottomHelpMessage: "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "modelVersion",
                    label: "模型名称",
                    bottomHelpMessage: "官方没有变动就不需要改默认值（为空时会自动取默认值，下面同理）",
                    component: "Input",
                    componentProps: {
                        placeholder: "默认置空即可",
                    },
                },
                {
                    field: "reqScheduleConf",
                    label: "生成模式",
                    bottomHelpMessage: "置空则默认为`general_v20_9B_pe`美感版——美感更好，出图多样性更多；`general_v20_9B_rephraser`标准版——图文匹配度更好，结构表现更好",
                    component: "Input",
                    componentProps: {
                        placeholder: "默认置空即可",
                    },
                },
                {
                    field: "usePreLlm",
                    label: "文本扩写",
                    bottomHelpMessage: "会针对输入prompt进行扩写优化，如果输入prompt较短建议开启，如果输入prompt较长建议关闭",
                    component: "Switch",
                },
                {
                    field: "useSr",
                    label: "超分",
                    bottomHelpMessage: "开启后可将生图宽高均乘以2，此参数打开后延迟会有增加。如上述宽高均为512和512，此参数关闭出图 512*512 ，此参数打开出图1024 * 1024",
                    component: "Switch",
                },
                {
                    field: "returnUrl",
                    label: "只返回链接",
                    bottomHelpMessage: "是否只返回图片链接 （链接有效期为24小时）",
                    component: "Switch",
                },
                {
                    component: "Divider",
                    label: "图生图",
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
                    field: "withImgReqKey",
                    label: "图生图算法",
                    bottomHelpMessage: "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "withImgModelVersion",
                    label: "模型名称",
                    bottomHelpMessage: "官方没有变动就不需要改默认值（为空时会自动取默认值，下面同理）",
                    component: "Input",
                    componentProps: {
                        placeholder: "默认置空即可",
                    },
                },
                {
                    field: "withImgUseRephraser",
                    label: "文本扩写",
                    bottomHelpMessage: "如果输入内容较短建议开启扩写，输入内容过长可根据情况进行关闭，否则可能会影响图文匹配程度",
                    component: "Switch",
                },
                {
                    field: "withImgReturnUrl",
                    label: "只返回链接",
                    bottomHelpMessage: "是否只返回图片链接 （链接有效期为24小时）",
                    component: "Switch",
                },
                {
                    field: "withImgControlnetArgs",
                    label: "图生图配置",
                    bottomHelpMessage: "参考模式和强度设置",
                    component: "GSubForm",
                    componentProps: {
                        schemas: [
                            {
                                field: "type",
                                label: "图生图参考模式",
                                bottomHelpMessage: "可参考输入图的canny（轮廓边缘）、depth（景深）、pose（人物姿态）进行出图",
                                component: "Input",
                                componentProps: {
                                    placeholder: "canny | depth | pose",
                                }
                            },
                            {
                                field: "strength",
                                label: "图生图参考的强度",
                                bottomHelpMessage: "数值范围(0.0, 1.0]，数值越大越接近参考图",
                                component: "InputNumber",
                                componentProps: {
                                    min: 0,
                                    max: 1,
                                    step: 0.01,
                                },
                            }
                        ]
                    },
                },
            ],
        }
    },
    {
        component: "Divider",
        label: "图片风格化",
        componentProps: {
            type: "horizontal",
            style: {
                fontWeight: "bold",
                color: "rgb(66, 162, 125)",
                fontSize: "16px",
            },
            orientation: "left",
            plain: true,
        },
    },
    {
        field: "douBao.useImageStyle",
        label: "开关",
        component: "Switch",
    },
    {
        field: "douBao.imageStyle",
        label: "配置",
        component: "GSubForm",
        componentProps: {
            modalProps: {
                title: "图片风格化配置"
            },
            style: {
                maxWidth: '600px', // 设置最大宽度
                maxHeight: '100px', // 设置最大高度
                overflowY: 'auto', // 添加垂直滚动条
            },
            schemas: [
                {
                    field: "reqKeyMap",
                    label: "风格化类型映射",
                    component: "GSubForm",
                    bottomHelpMessage: "匹配聊天命令中的风格化类型，一般保持默认即可；若要修改类型名称，请保证下面的子类型（若存在）同步修改；请求参数名除非官方文档变更，否则禁止修改！",
                    componentProps: {
                        multiple: true,
                        schemas: [
                            {
                                field: "key",
                                label: "风格化类型",
                                component: "Input"
                            },
                            {
                                field: "value",
                                label: "映射为请求参数",
                                component: "Input"
                            },
                        ],
                    }
                },
                {
                    field: "subReqKeyMap",
                    label: "子类型映射",
                    component: "GSubForm",
                    bottomHelpMessage: "保持默认即可；如果上面修改了类型名称，请保证此处（若存在）和上面的主类型同步修改；请求参数名除非官方文档变更，否则禁止修改！",
                    componentProps: {
                        multiple: true,
                        schemas: [
                            {
                                field: "key",
                                label: "风格化类型",
                                component: "Input"
                            },
                            {
                                field: "value",
                                label: "映射为请求参数",
                                component: "Input"
                            },
                        ],
                    }
                },
                {
                    field: "returnUrl",
                    label: "只返回链接",
                    bottomHelpMessage: "是否只返回图片链接 （链接有效期为24小时）",
                    component: "Switch",
                }
            ]
        }
    },
    {
        component: "Divider",
        label: "图片模仿",
        componentProps: {
            type: "horizontal",
            style: {
                fontWeight: "bold",
                color: "rgb(66, 162, 125)",
                fontSize: "16px",
            },
            orientation: "left",
            plain: true,
        },
    },
    {
        field: "douBao.useImageImitate",
        label: "开关",
        component: "Switch",
    },
    {
        field: "douBao.imageImitate",
        label: "配置",
        component: "GSubForm",
        componentProps: {
            modalProps: {
                title: "图片模仿配置"
            },
            style: {
                maxHeight: '100px', // 设置最大高度
                overflowY: 'auto', // 添加垂直滚动条
            },
            schemas: [
                {
                    field: "reqKey",
                    label: "算法",
                    bottomHelpMessage: "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "useSr",
                    label: "超分",
                    bottomHelpMessage: "开启后可将生图宽高均乘以2，此参数打开后延迟会有增加。如上述宽高均为512和512，此参数关闭出图 512*512 ，此参数打开出图1024 * 1024",
                    component: "Switch",
                },
                {
                    field: "returnUrl",
                    label: "只返回链接",
                    bottomHelpMessage: "是否只返回图片链接 （链接有效期为24小时）",
                    component: "Switch",
                },
            ]
        }
    },
];
