import { ConfigSchemaType } from "../../types";

export const commandPromptSchema = (): ConfigSchemaType[] => [
    {
        label: "命令预设",
        // 第一个分组标记开始，无需标记结束
        component: "SOFT_GROUP_BEGIN",
    },
    {
        field: "commandPrompt.useCommandPrompt",
        label: "命令预设开关",
        component: "Switch",
        bottomHelpMessage: "启用命令预设功能，可通过`#命令`使群BOT进入相关功能预设场景。开启此功能时请确保启用AI聊天接口",
    },
    {
        field: "commandPrompt.commandDict",
        label: "命令列表",
        component: "GSubForm",
        bottomHelpMessage: "查看命令预设列表，可修改预设内容",
        componentProps: {
            multiple: true,
            schemas: [
                {
                    field: "cmd",
                    label: "命令",
                    component: "Input",
                    required: true,
                    bottomHelpMessage: "使用`#命令`触发`"
                },
                {
                    field: "prompt",
                    label: "预设文本",
                    component: "GSubForm",
                    bottomHelpMessage: "触发命令时发送给群BOT的群聊AI的文本",
                    componentProps: {
                        multiple: true,
                        schemas: [
                            {
                                field: "text",
                                label: "文本",
                                component: "InputTextArea",
                                componentProps: {
                                    rows: 3
                                },
                                required: true,
                                bottomHelpMessage: "可配置多个，配置多个时会随机选择其中一项，所以请注意和结束提示词等项的兼容性"
                            }
                        ]
                    }
                },
                {
                    field: "finishMsg",
                    label: "结束提示词",
                    component: "Input",
                    bottomHelpMessage: "若群BOT的AI生成内容包含结束提示词，群BOT退出预设情景，多项之间以`|`分隔",
                    componentProps: {
                        placeholder: "有需要BOT自行终止情景的需求时输入该项"
                    }
                },
                {
                    field: "timeout",
                    label: "超时时间（秒）",
                    component: "InputNumber",
                    bottomHelpMessage: "超时后群BOT退出预设场景，为`0`时不会超时。群成员也可通过输入`#结束`退出",
                    componentProps: {
                        min: 0,
                        step: 1
                    }
                },
                {
                    field: "timeoutChat",
                    label: "超时提示",
                    component: "Input",
                    bottomHelpMessage: "超时后群BOT退出预设场景时发送给群聊的提示",
                }
            ]
        }
    }
]