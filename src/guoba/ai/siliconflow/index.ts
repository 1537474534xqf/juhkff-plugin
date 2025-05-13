import { getVideoGenerateModel, getVoiceGenerateCharacter } from "./handler.js";

export const sfSchema = () => [
    {
        label: "SiliconFlow",
        // 第四个分组标记开始
        component: "SOFT_GROUP_BEGIN",
    },
    {
        field: "siliconflow.useSF",
        label: "SiliconFlow开关",
        bottomHelpMessage: "启用SiliconFlow相关功能，可使用`#sf`命令查询可用指令",
        component: "Switch",
    },
    {
        field: "siliconflow.sfApiKey",
        label: "API Key",
        component: "Input",
        componentProps: {
            placeholder: "请输入SiliconFlow API Key",
        }
    },
    {
        component: "Divider",
        label: "视频生成",
        componentProps: {
            type: "horizontal",
            style: {
                fontWeight: "bold",
                color: "rgb(76, 113, 201)",
                fontsize: "16px",
            },
            orientation: "left",
            plain: true,
        }
    },
    {
        field: "siliconflow.useVideoGenerate",
        label: "视频生成开关",
        component: "Switch",
    },
    {
        field: "siliconflow.videoGenerateUrl",
        label: "视频生成URL",
        component: "Input",
        bottomHelpMessage: "一般无需修改此项",
        componentProps: {
            placeholder: "请输入视频生成URL",
        }
    },
    {
        field: "siliconflow.videoGenerateRequestUrl",
        label: "视频生成结果URL",
        component: "Input",
        bottomHelpMessage: "一般无需修改此项",
        componentProps: {
            placeholder: "请输入视频生成结果URL",
        }
    },
    {
        field: "siliconflow.videoGenerateModel",
        label: "视频生成模型",
        component: "AutoComplete",
        componentProps: {
            placeholder: "请输入视频生成模型",
            options: getVideoGenerateModel(),
        }
    },
    {
        component: "Divider",
        label: "音频生成",
        componentProps: {
            type: "horizontal",
            style: {
                fontWeight: "bold",
                color: "rgb(76, 113, 201)",
                fontsize: "16px",
            },
            orientation: "left",
            plain: true,
        }
    },
    {
        field: "siliconflow.useVoiceGenerate",
        label: "语音生成开关",
        component: "Switch",
    },
    {
        field: "siliconflow.chatTransVoiceResponse",
        label: "群聊生成内容转语音",
        bottomHelpMessage: "独立于语音生成开关。开启后，机器人的回复内容有概率以语音形式发送",
        component: "Switch",
    },
    {
        field: "siliconflow.chatTransVoiceRate",
        label: "群聊生成内容转语音概率",
        component: "InputNumber",
        componentProps: {
            min: 0,
            max: 1,
            step: 0.01,
        },
        bottomHelpMessage: "当群聊生成内容转语音为开启状态时，此选项才有效"
    },
    {
        field: "siliconflow.voiceGenerateUrl",
        label: "音频生成URL",
        component: "Input",
        bottomHelpMessage: "一般无需修改此项",
        componentProps: {
            placeholder: "请输入音频生成URL",
        }
    },
    {
        field: "siliconflow.voiceGenerateModel",
        label: "音频生成模型",
        component: "AutoComplete",
        componentProps: {
            placeholder: "请选择或输入音频生成模型",
            options: [
                {
                    label: "FunAudioLLM/CosyVoice2-0.5B",
                    value: "FunAudioLLM/CosyVoice2-0.5B"
                }
            ]
        }
    },
    {
        field: "siliconflow.voiceGenerateCharacter",
        label: "音色",
        component: "AutoComplete",
        bottomHelpMessage: "选择或输入模型具有的音色",
        componentProps: {
            placeholder: "请选择或输入音色",
            options: getVoiceGenerateCharacter(),
        }
    },
]