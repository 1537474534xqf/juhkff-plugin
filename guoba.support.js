import path from "path";
import lodash from "lodash";
import { Objects } from "./javascript/utils/kits.js";
import { PLUGIN_RESOURCES_DIR } from "./javascript/model/path.js";
import { agentMap } from "./javascript/model/map.js";
// 支持锅巴
export function supportGuoba() {
    return {
        // 插件信息，将会显示在前端页面
        // 如果你的插件没有在插件库里，那么需要填上补充信息
        // 如果存在的话，那么填不填就无所谓了，填了就以你的信息为准
        pluginInfo: {
            // name 为插件唯一标识，尽量不要与其他插件重复
            name: "juhkff-plugin",
            // title 为显示名称
            title: "综合插件 (juhkff-plugin)",
            // 插件描述
            description: "主动回复群聊、表情偷取、日报推送等综合功能插件",
            // 作者可以为字符串也可以为数组，当有多个作者时建议使用数组
            author: ["@扎克芙芙"],
            // 作者主页地址。若author为数组，则authorLink也需要为数组，且需要与author一一对应
            authorLink: ["https://github.com/juhkff"],
            // 仓库地址
            link: "https://github.com/juhkff/juhkff-plugin",
            isV3: true,
            isV2: false,
            // 是否显示在左侧菜单，可选值：auto、true、false
            // 当为 auto 时，如果配置项大于等于 3 个，则显示在左侧菜单
            showInMenu: "auto",
            // 显示图标，此为个性化配置
            // 图标可在 https://icon-sets.iconify.design 这里进行搜索
            icon: "material-symbols:robot-2-rounded",
            // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
            iconColor: "#288ac3",
            // 如果想要显示成图片，也可以填写图标路径（绝对路径）
            iconPath: path.join(PLUGIN_RESOURCES_DIR, "images/icon.jpg"),
        },
        // 配置项信息
        configInfo: {
            // 配置项 schemas
            // 【组件类型】，可参考
            // https://doc.vvbin.cn/components/introduction.html
            // https://3x.antdv.com/components/overview-cn/
            schemas: [
                {
                    label: "日报配置",
                    // 第二个分组标记开始
                    component: "SOFT_GROUP_BEGIN",
                },
                {
                    field: "dailyReport.useDailyReport",
                    label: "日报开关",
                    bottomHelpMessage: "若开启，BOT会启用 `#日报` 命令和定时发送任务",
                    component: "Switch",
                },
                {
                    field: "dailyReport.dailyReportFullShow",
                    label: "新闻是否显示完全信息",
                    bottomHelpMessage: "根据个人喜好调整：新闻单行显示/换行完全显示",
                    component: "Switch",
                },
                {
                    field: "dailyReport.alapiToken",
                    label: "alapi_token",
                    bottomHelpMessage: "该项置空即可",
                    component: "Input",
                },
                {
                    field: "dailyReport.push",
                    label: "是否开启定时推送",
                    bottomHelpMessage: "开启后可在特定时刻自动推送日报到指定群组",
                    component: "Switch",
                },
                {
                    field: "dailyReport.dailyReportTime",
                    label: "定时发送日报时间",
                    bottomHelpMessage:
                        "秒[0,59] 分钟[0,59] 小时[0,23] 日期[1,31] 月份[1,12] 星期[0,7/SUN,SAT]",
                    component: "EasyCron",
                    componentProps: {
                        placeholder: "*表示任意，?表示不指定（月日和星期互斥）",
                    },
                },
                {
                    field: "dailyReport.pushGroupList",
                    label: "推送群组列表",
                    bottomHelpMessage: "推送群组列表",
                    component: "GSelectGroup",
                },
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
                    bottomHelpMessage: "目前未实现本地图库，必发偷的图，该配置暂时无意义",
                    component: "InputNumber",
                    componentProps: {
                        min: 0,
                        max: 1,
                        step: 0.01,
                    },
                    required: true,
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
                                required: false,
                            },
                        ],
                    },
                },
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
                            overflowY: 'auto'   // 添加垂直滚动条
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
                            overflowY: 'auto'   // 添加垂直滚动条
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
                                bottomHelpMessage:
                                    "官方没有变动就不需要改默认值",
                                component: "Input",
                            },
                            {
                                field: "modelVersion",
                                label: "模型名称",
                                bottomHelpMessage:
                                    "官方没有变动就不需要改默认值（为空时会自动取默认值，下面同理）",
                                component: "Input",
                                componentProps: {
                                    placeholder: "默认置空即可",
                                },
                            },
                            {
                                field: "reqScheduleConf",
                                label: "生成模式",
                                bottomHelpMessage:
                                    "置空则默认为`general_v20_9B_pe`美感版——美感更好，出图多样性更多；`general_v20_9B_rephraser`标准版——图文匹配度更好，结构表现更好",
                                component: "Input",
                                componentProps: {
                                    placeholder: "默认置空即可",
                                },
                            },
                            {
                                field: "usePreLlm",
                                label: "文本扩写",
                                bottomHelpMessage:
                                    "会针对输入prompt进行扩写优化，如果输入prompt较短建议开启，如果输入prompt较长建议关闭",
                                component: "Switch",
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
                                bottomHelpMessage:
                                    "官方没有变动就不需要改默认值",
                                component: "Input",
                            },
                            {
                                field: "withImgModelVersion",
                                label: "模型名称",
                                bottomHelpMessage:
                                    "官方没有变动就不需要改默认值（为空时会自动取默认值，下面同理）",
                                component: "Input",
                                componentProps: {
                                    placeholder: "默认置空即可",
                                },
                            },
                            {
                                field: "withImgUseRephraser",
                                label: "文本扩写",
                                bottomHelpMessage:
                                    "如果输入内容较短建议开启扩写，输入内容过长可根据情况进行关闭，否则可能会影响图文匹配程度",
                                component: "Switch",
                            },
                            {
                                field: "withImgReturnUrl",
                                label: "只返回链接",
                                bottomHelpMessage:
                                    "是否只返回图片链接 （链接有效期为24小时）",
                                component: "Switch",
                            },
                            {
                                field: "withImgControlnetArgs",
                                label: "图生图配置",
                                bottomHelpMessage:
                                    "参考模式和强度设置",
                                component: "GSubForm",
                                componentProps: {
                                    schemas: [
                                        {
                                            field: "type",
                                            label: "图生图参考模式",
                                            bottomHelpMessage:
                                                "可参考输入图的canny（轮廓边缘）、depth（景深）、pose（人物姿态）进行出图",
                                            component: "Input",
                                            componentProps: {
                                                placeholder: "canny | depth | pose",
                                            }
                                        },
                                        {
                                            field: "strength",
                                            label: "图生图参考的强度",
                                            bottomHelpMessage:
                                                "数值范围(0.0, 1.0]，数值越大越接近参考图",
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
                    label: "帮助图片",
                    // 第一个分组标记开始，无需标记结束
                    component: "SOFT_GROUP_BEGIN",
                },
                {
                    field: "helpGen.useHelpGen",
                    label: "开启帮助",
                    bottomHelpMessage:
                        "开启后，可生成帮助图片",
                    component: "Switch",
                },
                {
                    field: "helpGen.command",
                    label: "命令",
                    bottomHelpMessage:
                        "机器人收到`#命令`会回复帮助图片，修改此项后需重启机器人",
                    component: "Input",
                },
                {
                    "field": "helpGen.titleZh",
                    "label": "标题",
                    "bottomHelpMessage":
                        "一般写图片的中文标题，为空则取命令为标题",
                    "component": "Input",
                },
                {
                    field: "helpGen.titleEn",
                    label: "小标题",
                    bottomHelpMessage:
                        "一般写图片的英文标题，为空则取内置默认值",
                    component: "Input",
                },
                {
                    field: "helpGen.hd",
                    label: "高清模式",
                    bottomHelpMessage:
                        "图片质量更好，生成速度更慢，可能占用更多机器资源",
                    component: "Switch",
                },
                {
                    field: "helpGen.colorOptions",
                    label: "字体颜色",
                    bottomHelpMessage:
                        "自定义字体颜色",
                    component: "GSubForm",
                    componentProps: {
                        modalProps: {
                            title: "自定义各区域字体颜色"
                        },
                        style: {
                            maxHeight: '100px', // 设置最大高度
                            overflowY: 'auto',   // 添加垂直滚动条
                        },
                        schemas: [
                            {
                                field: "titleColor",
                                label: "标题颜色",
                                component: "GColorPicker",
                                bottomHelpMessage:
                                    "默认值 rgba(255, 255, 255, 1)，无法隐藏",
                                componentProps: {
                                    defaultValue: "rgba(255, 255, 255, 1)",
                                },
                            },
                            {
                                field: "labelColor",
                                label: "小标题颜色",
                                component: "GColorPicker",
                                bottomHelpMessage:
                                    "默认值 rgba(255, 255, 255, 1)，无法隐藏",
                                componentProps: {
                                    defaultValue: "rgba(255, 255, 255, 1)",
                                },
                            },
                            {
                                field: "copyrightColor",
                                label: "copyRight颜色",
                                component: "GColorPicker",
                                bottomHelpMessage:
                                    "默认值 rgba(255, 255, 255, 1)，无法隐藏",
                                componentProps: {
                                    defaultValue: "rgba(255, 255, 255, 1)",
                                },
                            },
                            {
                                field: "groupColor",
                                label: "功能组颜色",
                                component: "GColorPicker",
                                bottomHelpMessage:
                                    "默认值 rgba(206, 183, 139, 1)",
                                componentProps: {
                                    defaultValue: "rgba(206, 183, 139, 1)",
                                },
                            },
                            {
                                field: "groupTitleColor",
                                label: "功能组命令颜色",
                                component: "GColorPicker",
                                bottomHelpMessage:
                                    "默认值 rgba(240, 197, 43, 1)",
                                componentProps: {
                                    defaultValue: "rgba(240, 197, 43, 1)",
                                },
                            },
                            {
                                field: "groupDescColor",
                                label: "功能组描述颜色",
                                component: "GColorPicker",
                                bottomHelpMessage:
                                    "默认值 rgba(243, 182, 109, 1)",
                                componentProps: {
                                    defaultValue: "rgba(243, 182, 109, 1)",
                                },
                            },
                            {
                                field: "helpNameColor",
                                label: "帮助名称颜色",
                                component: "GColorPicker",
                                bottomHelpMessage:
                                    "默认值 rgba(111, 186, 243, 0.946)",
                                componentProps: {
                                    defaultValue: "rgba(111, 186, 243, 0.946)",
                                },
                            },
                            {
                                field: "helpTitleColor",
                                label: "帮助命令颜色",
                                component: "GColorPicker",
                                bottomHelpMessage:
                                    "默认值 rgba(240, 197, 43, 1)",
                                componentProps: {
                                    defaultValue: "rgba(240, 197, 43, 1)",
                                },
                            },
                            {
                                field: "helpDescColor",
                                label: "帮助描述颜色",
                                component: "GColorPicker",
                                bottomHelpMessage:
                                    "默认值 rgba(255, 255, 255, 1)",
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
                    bottomHelpMessage:
                        "你可以在这添加其它插件的功能，帮助图片也会生成相应内容",
                    component: "GSubForm",
                    componentProps: {
                        multiple: true,
                        schemas: [
                            {
                                field: "name",
                                label: "命令/功能名称",
                                bottomHelpMessage:
                                    "给你的功能起个名。为功能组时必填",
                                component: "Input",
                            },
                            {
                                field: "type",
                                label: "功能类型",
                                bottomHelpMessage:
                                    "主动式：指令主动触发；被动式：满足条件时自动触发；功能组：内含多个功能，例如`豆包AI`包含`图片生成`、`视频生成`多个子功能；子功能：属于某个功能组",
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
                                bottomHelpMessage:
                                    "需包含#等前缀。一般来说被动式命令不需要填这项，但也可以填",
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
                                bottomHelpMessage:
                                    "类型为子功能时必填，并确保和已有的功能组名一致。其它类型时忽略此项",
                                component: "Input",
                            }
                        ],
                    },
                }
            ],
            // 获取配置数据方法（用于前端填充显示数据）
            getConfigData() {
                var config = setting.getAllConfig();
                return config;
            },
            // 设置配置的方法（前端点确定后调用的方法）
            setConfigData(data, { Result }) {
                var config = setting.getAllConfig();
                // 更新前校验和处理
                var beforeResult = beforeUpdate(data, config);
                if (beforeResult.code != 0) {
                    return Result.error(beforeResult.code, null, beforeResult.message);
                }
                for (let [keyPath, value] of Object.entries(data)) {
                    var keyPaths = keyPath.split(".");
                    var app = keyPaths[0];
                    var key = keyPaths[1];
                    if (!(app in config)) config[app] = {};
                    config[app][key] = value;
                }
                // 更新后校验和处理
                var afterResult = afterUpdate(config);
                if (afterResult.code != 0) {
                    return Result.error(afterResult.code, null, afterResult.message);
                }
                // 前后配置比较处理
                var compare = validate(beforeResult, afterResult, config);
                if (compare.code != 0) {
                    return Result.error(compare.code, null, compare.message);
                }
                var err = setting.setConfig(config);
                if (err != null)
                    return Result.err(-1, null, "保存失败: " + err.message);
                else {
                    onFinish(config);
                    return Result.ok({}, "保存成功~");
                }
            },
        },
    };
}

/********************************** Config 更新生命周期 **********************************/
/**
 * 更新前校验和处理
 * @param {*} data 传入数据
 * @param {*} config 更新前配置
 * @returns code, message, data
 */
function beforeUpdate(data, config) {
    var preChatApi = config.autoReply.chatApi;
    var preVisualReplaceChat = config.autoReply.visualReplaceChat;
    if (data["helpGen.manualList"]
        .some((item) => Objects.isNull(item?.name?.trim())
            && Objects.isNull(item?.command?.trim())
            && Objects.isNull(item?.dsc?.trim())
        )) {
        return {
            code: -1,
            message: "功能名称、调用格式和功能描述至少填写一项！",
        };
    }
    var helpGroupList = data["helpGen.manualList"]
        .filter((item) => item.type == "group")
        .map((item) => item?.name.trim());
    if (helpGroupList.length > 0 && helpGroupList.some(name => Objects.isNull(name))) {
        return {
            code: -1,
            message: "功能组名称不能为空，请检查",
        };
    }
    var helpSubList = data["helpGen.manualList"]
        .filter((item) => item.type == "sub")
        .map((item) => item?.belongTo?.trim());
    if (helpSubList.length > 0) {
        if (helpSubList.some(sub => Objects.isNull(sub))) {
            return {
                code: -1,
                message: "子功能所属功能组名称不能为空，请检查",
            };
        }
        if (helpSubList.some(sub => !helpGroupList.includes(sub))) {
            return {
                code: -1,
                message: "子功能所属功能组不存在，请检查",
            };
        }
    }
    return {
        code: 0,
        message: "校验成功",
        data: {
            chatApi: preChatApi,
            visualReplaceChat: preVisualReplaceChat,
        },
    };
}

/**
 * 更新后校验和处理
 * @param {*} config 更新后配置
 * @returns code, message, data
 */
function afterUpdate(config) {
    if (config.autoReply.useAutoReply) {
        if (Objects.isNull(config.autoReply.chatApi)) {
            return {
                code: -1,
                message: "请选择有效的群聊AI接口",
            };
        }
        if (Objects.isNull(config.autoReply.chatApiKey)) {
            return {
                code: -1,
                message: "请输入有效的群聊AI ApiKey",
            };
        }
    }
    if (config.autoReply.useVisual) {
        if (Objects.isNull(config.autoReply.visualApi)) {
            return {
                code: -1,
                message: "请选择有效的视觉AI接口",
            };
        }
        if (Objects.isNull(config.autoReply.visualApiKey)) {
            return {
                code: -1,
                message: "请输入有效的视觉AI ApiKey",
            };
        }
        /*
        if (Objects.isNull(config.autoReply.visualModel)) {
          return {
            code: -1,
            message: "请选择有效的视觉AI模型",
          };
        }
        */
    }
    var newChatApi = config.autoReply.chatApi;
    var newVisualReplaceChat = config.autoReply.visualReplaceChat;
    return {
        code: 0,
        message: "校验成功",
        data: {
            chatApi: newChatApi,
            visualReplaceChat: newVisualReplaceChat,
        },
    };
}

/**
 * 前后配置比较处理
 * @param {*} before beforeUpdate 阶段暂存结果
 * @param {*} after afterUpdate 阶段暂存结果
 * @param {*} config 配置
 * @returns code, message
 */
function validate(before, after, config) {
    var origin = before.data;
    var after = after.data;
    if (origin.chatApi != after.chatApi) {
        config.autoReply.chatModel = "";
    }
    // 因为实现逻辑和结构体不同，所以切换时删除之前的redis存储
    if (origin.visualReplaceChat != after.visualReplaceChat) {
        removeSubKeys("juhkff:auto_reply", EMOTION_KEY).then(() => { });
    }
    return {
        code: 0,
        message: "校验成功",
    };
}

/**
 * 配置更新后回调
 * @param {*} config
 */
function onFinish(config) {
    var chatInstance = chatMap[config.autoReply.chatApi];
    if (config.autoReply.useAutoReply)
        chatInstance?.[ChatInterface.getModelMap]();

    var visualInstance = visualMap[config.autoReply.visualApi];
    if (config.autoReply.useVisual)
        visualInstance?.[VisualInterface.getModelMap]();
}

/********************************** 函数调用 **********************************/

