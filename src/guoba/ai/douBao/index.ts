import { douBao } from "../../../apps/ai/douBao.js";
import { ConfigSchemaType } from "../../../types/index.js";

export const douBaoSchema = (): ConfigSchemaType[] => [
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
        label: "常规服务配置",
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
        field: "douBao.apiKey",
        label: "常规ApiKey",
        bottomHelpMessage: "用于下面同色服务。官网: https://console.volcengine.com/ark/",
        component: "InputPassword",
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
                overflowY: 'auto'   // 添加垂直滚动条
            },
            schemas: [
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
                    component: "Select",
                    componentProps: {
                        options: Object.keys(douBao.videoGenerateMap).map((key) => ({
                            label: key,
                            value: key
                        })),
                    },
                },
            ]
        },
    },
    {
        component: "Divider",
        label: "图片生成",
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
                overflowY: 'auto'   // 添加垂直滚动条
            },
            schemas: [
                {
                    field: "model",
                    label: "图片生成模型",
                    component: "Select",
                    componentProps: {
                        options: Object.keys(douBao.imageGenerateMap).map((key) => ({
                            label: key,
                            value: key
                        })),
                    }
                },
                {
                    field: "size",
                    label: "图片大小",
                    component: "AutoComplete",
                    componentProps: {
                        options: [
                            {
                                label: "1024x1024",
                                value: "1024x1024"
                            },
                            {
                                label: "864x1152",
                                value: "864x1152"
                            },
                            {
                                label: "1152x864",
                                value: "1152x864"
                            },
                            {
                                label: "1280x720",
                                value: "1280x720"
                            },
                            {
                                label: "720x1280",
                                value: "720x1280"
                            },
                            {
                                label: "832x1248",
                                value: "832x1248"
                            },
                            {
                                label: "1248x832",
                                value: "1248x832"
                            },
                            {
                                label: "1512x648",
                                value: "1512x648"
                            },
                        ],
                    }
                },
                {
                    field: "seed",
                    label: "种子",
                    bottomHelpMessage:
                        "随机数种子，取值范围为 [-1, 2147483647]。-1 为算法随机生成。如果希望生成内容保持一致，可以使用相同的 seed 参数值",
                    component: "InputNumber",
                    componentProps: {
                        min: -1,
                        max: 2147483647,
                    },
                },
                {
                    field: "guidance_scale",
                    label: " 一致程度",
                    bottomHelpMessage:
                        "值越大，模型自由度越小，与用户输入的提示词相关性越强。取值范围：[1.0, 10.0]",
                    component: "InputNumber",
                    componentProps: {
                        min: 1,
                        max: 10,
                        step: 0.1,
                    },
                },
                {
                    field: "watermark",
                    label: "水印",
                    bottomHelpMessage:
                        "是否添加水印",
                    component: "Switch"
                }
            ],
        }
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
        bottomHelpMessage:
            "用于下面同色服务",
        component: "GSubForm",
        componentProps: {
            style: {
                maxHeight: '100px', // 设置最大高度
                overflowY: 'auto'   // 添加垂直滚动条
            },
            schemas: [
                {
                    field: "accessKeyId",
                    label: "AccessKeyId",
                    bottomHelpMessage:
                        "必填！官网密钥: https://console.volcengine.com/iam/keymanage",
                    component: "InputPassword",
                },
                {
                    field: "secretAccessKey",
                    label: "SecretAccessKey",
                    bottomHelpMessage:
                        "必填！官网密钥: https://console.volcengine.com/iam/keymanage",
                    component: "InputPassword",
                },
                {
                    field: "host",
                    label: "服务Host",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "region",
                    label: "服务Region",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "service",
                    label: "服务名称",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "action",
                    label: "服务Action",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "version",
                    label: "服务Version",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
            ]
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
                overflowY: 'auto',   // 添加垂直滚动条
            },
            schemas: [
                {
                    field: "reqKeyMap",
                    label: "风格化类型映射",
                    component: "GSubForm",
                    bottomHelpMessage:
                        "匹配聊天命令中的风格化类型，一般保持默认即可；若要修改类型名称，请保证下面的子类型（若存在）同步修改；请求参数名除非官方文档变更，否则禁止修改！",
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
                    bottomHelpMessage:
                        "保持默认即可；如果上面修改了类型名称，请保证此处（若存在）和上面的主类型同步修改；请求参数名除非官方文档变更，否则禁止修改！",
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
                    bottomHelpMessage:
                        "是否只返回图片链接 （链接有效期为24小时）",
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
                overflowY: 'auto',   // 添加垂直滚动条
            },
            schemas: [
                {
                    field: "reqKey",
                    label: "算法",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "useSr",
                    label: "超分",
                    bottomHelpMessage:
                        "开启后可将生图宽高均乘以2，此参数打开后延迟会有增加。如上述宽高均为512和512，此参数关闭出图 512*512 ，此参数打开出图1024 * 1024",
                    component: "Switch",
                },
                {
                    field: "returnUrl",
                    label: "只返回链接",
                    bottomHelpMessage:
                        "是否只返回图片链接 （链接有效期为24小时）",
                    component: "Switch",
                },
            ]
        }
    },
    {
        component: "Divider",
        label: "音频服务配置",
        componentProps: {
            type: "horizontal",
            style: {
                fontWeight: "bold",
                color: "rgb(161, 84, 212)",
                fontSize: "16px",
            },
            orientation: "left",
            plain: true,
        },
    },
    {
        field: "douBao.songService",
        label: "配置",
        bottomHelpMessage:
            "用于下面同色服务",
        component: "GSubForm",
        componentProps: {
            style: {
                maxHeight: '100px', // 设置最大高度
                overflowY: 'auto'   // 添加垂直滚动条
            },
            schemas: [
                {
                    field: "accessKeyId",
                    label: "AccessKeyId",
                    bottomHelpMessage:
                        "必填！官网密钥: https://console.volcengine.com/iam/keymanage",
                    component: "InputPassword",
                },
                {
                    field: "secretAccessKey",
                    label: "SecretAccessKey",
                    bottomHelpMessage:
                        "必填！官网密钥: https://console.volcengine.com/iam/keymanage",
                    component: "InputPassword",
                },
                {
                    field: "host",
                    label: "服务Host",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "region",
                    label: "服务Region",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "service",
                    label: "服务名称",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
            ]
        }
    },

    /*
    {
        component: "Divider",
        label: "歌词生成",
        componentProps: {
            type: "horizontal",
            style: {
                fontWeight: "bold",
                color: "rgb(161, 84, 212)",
                fontSize: "16px",
            },
            orientation: "left",
            plain: true,
        },
    },
    {
        field: "douBao.useLyricsGenerate",
        label: "歌词生成开关",
        component: "Switch",
    },
    {
        field: "douBao.lyricsGenerate",
        label: "配置",
        component: "GSubForm",
        componentProps: {
            modalProps: {
                title: "歌词生成配置"
            },
            style: {
                maxHeight: '100px', // 设置最大高度
                overflowY: 'auto'   // 添加垂直滚动条
            },
            schemas: [
                {
                    field: "action",
                    label: "服务Action",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "version",
                    label: "服务Version",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "genre",
                    label: "歌词曲风",
                    bottomHelpMessage: "生成歌词的曲风，不传默认走预测",
                    component: "AutoComplete",
                    componentProps: {
                        options: douBao.queryLyricsGenre().map((key) => ({
                            label: key,
                            value: key
                        })),
                    }
                },
                {
                    field: "mood",
                    label: "歌词风格",
                    bottomHelpMessage: "生成歌词的风格，不传默认走预测",
                    component: "AutoComplete",
                    componentProps: {
                        options: douBao.queryLyricsMood().map((key) => ({
                            label: key,
                            value: key
                        })),
                    }
                },
                {
                    field: "modelVersion",
                    label: "模型版本",
                    bottomHelpMessage: "生成歌词使用版本，一般无需修改",
                    component: "Input",
                }
            ]
        },
    },
    */
    {
        component: "Divider",
        label: "歌曲生成",
        componentProps: {
            type: "horizontal",
            style: {
                fontWeight: "bold",
                color: "rgb(161, 84, 212)",
                fontSize: "16px",
            },
            orientation: "left",
            plain: true,
        },
    },
    {
        field: "douBao.useSongGenerate",
        label: "歌曲生成开关",
        component: "Switch",
    },
    {
        field: "douBao.songGenerate",
        label: "配置",
        component: "GSubForm",
        componentProps: {
            modalProps: {
                title: "歌曲生成配置"
            },
            style: {
                maxHeight: '100px', // 设置最大高度
                overflowY: 'auto'   // 添加垂直滚动条
            },
            schemas: [
                {
                    field: "action",
                    label: "服务Action",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "version",
                    label: "服务Version",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "genre",
                    label: "歌曲曲风",
                    bottomHelpMessage: "生成歌曲的曲风，如果不传或者传入空字符串，服务会基于内容提取或预测",
                    component: "AutoComplete",
                    componentProps: {
                        options: douBao.querySongGenre().map((key) => ({
                            label: key,
                            value: key
                        })),
                    }
                },
                {
                    field: "mood",
                    label: "歌曲风格",
                    bottomHelpMessage: "生成歌曲的风格，如果不传或者传入空字符串，服务会基于内容提取或预测",
                    component: "AutoComplete",
                    componentProps: {
                        options: douBao.querySongMood().map((key) => ({
                            label: key,
                            value: key
                        })),
                    }
                },
                {
                    field: "timbre",
                    label: "歌曲音色",
                    bottomHelpMessage: "生成歌曲的音色，如果不传或者传入空字符串，服务会基于内容提取或预测",
                    component: "AutoComplete",
                    componentProps: {
                        options: douBao.querySongTimbre().map((key) => ({
                            label: key,
                            value: key
                        })),
                    }
                },
                {
                    field: "queryAction",
                    label: "查询Action",
                    bottomHelpMessage: "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "queryVersion",
                    label: "查询Version",
                    bottomHelpMessage: "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "returnLyrics",
                    label: "返回歌词",
                    component: "Switch",
                    bottomHelpMessage: "发送歌曲的同时发送歌词文本",
                }
            ]
        },
    },
    {
        field: "douBao.useBgmGenerate",
        label: "纯音乐生成开关",
        component: "Switch",
    },
    {
        field: "douBao.bgmGenerate",
        label: "配置",
        component: "GSubForm",
        componentProps: {
            modalProps: {
                title: "歌曲生成配置"
            },
            style: {
                maxHeight: '100px', // 设置最大高度
                overflowY: 'auto'   // 添加垂直滚动条
            },
            schemas: [
                {
                    field: "action",
                    label: "服务Action",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "version",
                    label: "服务Version",
                    bottomHelpMessage:
                        "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "genre",
                    label: "歌曲曲风",
                    bottomHelpMessage: "生成歌曲的曲风，如果不传或者传入空字符串，服务会基于内容提取或预测",
                    component: "AutoComplete",
                    componentProps: {
                        options: douBao.queryBgmGenre().map((key) => ({
                            label: key,
                            value: key
                        })),
                    }
                },
                {
                    field: "mood",
                    label: "歌曲情绪",
                    bottomHelpMessage: "生成歌曲的情绪，如果不传或者传入空字符串，服务会基于内容提取或预测",
                    component: "AutoComplete",
                    componentProps: {
                        options: douBao.queryBgmMood().map((key) => ({
                            label: key,
                            value: key
                        })),
                    }
                },
                {
                    field: "instrument",
                    label: "歌曲乐器",
                    bottomHelpMessage: "生成歌曲的乐器，如果不传或者传入空字符串，服务会基于内容提取或预测",
                    component: "AutoComplete",
                    componentProps: {
                        options: douBao.queryBgmInstrument().map((key) => ({
                            label: key,
                            value: key
                        })),
                    }
                },
                {
                    field: "theme",
                    label: "歌曲主题",
                    bottomHelpMessage: "生成歌曲的主题，如果不传或者传入空字符串，服务会基于内容提取或预测",
                    component: "AutoComplete",
                    componentProps: {
                        options: douBao.queryBgmTheme().map((key) => ({
                            label: key,
                            value: key
                        })),
                    }
                },
                {
                    field: "queryAction",
                    label: "查询Action",
                    bottomHelpMessage: "官方没有变动就不需要改默认值",
                    component: "Input",
                },
                {
                    field: "queryVersion",
                    label: "查询Version",
                    bottomHelpMessage: "官方没有变动就不需要改默认值",
                    component: "Input",
                }
            ]
        },
    },
]