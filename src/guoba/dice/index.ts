import { config } from "../../config/index.js";
import { ConfigSchemaType } from "../../types/index.js";

export const diceSchema = (): ConfigSchemaType[] => [
    {
        label: "骰子配置",
        // 第三个分组标记开始
        component: "SOFT_GROUP_BEGIN",
    },
    {
        field: "dice.useDice",
        label: "骰子功能开关",
        component: "Switch",
    },
    {
        field: "dice.default",
        label: "默认",
        component: "AutoComplete",
        bottomHelpMessage: "默认骰子，使用 `#dice` 命令不带参数时使用的骰子类型",
        componentProps: {
            options: [...(config.dice.presets || []), ...(config.dice.packs || [])].map(each => ({
                label: each.name,
                value: each.name
            }))
        }
    },
    {
        field: "dice.briefMode",
        label: "简洁输出",
        component: "Switch",
        bottomHelpMessage: "结果简洁显示"
    },
    {
        field: "dice.presets",
        label: "基础骰子类型",
        component: "GSubForm",
        bottomHelpMessage: "更新该项配置后需要保存并刷新页面后才可在其它选项中选择！",
        componentProps: {
            multiple: true,
            schemas: [
                {
                    field: "name",
                    label: "名称",
                    component: "Input",
                    required: true,
                },
                {
                    field: "isNumber",
                    label: "数字骰",
                    bottomHelpMessage: "不管是还是否，都要点一下才能提交。数字骰在加入组合时会自动算出数字总和（数字骰可以包含非数字，但必须包含数字）",
                    component: "Switch",
                    required: true
                },
                {
                    field: "faces",
                    label: "各面值",
                    component: "Input",
                    bottomHelpMessage: "格式：`值1,值2,值3`（英文逗号），需严格遵循格式，不可带多余空格",
                    required: true
                }
            ]
        }
    },
    {
        field: "dice.packs",
        label: "骰子组合",
        component: "GSubForm",
        bottomHelpMessage: "更新该项配置后需要保存并刷新页面后才可在其它选项中选择！",
        componentProps: {
            multiple: true,
            schemas: [
                {
                    field: "name",
                    label: "骰子组合名称",
                    component: "Input",
                    required: true
                },
                {
                    field: "bundle",
                    label: "骰子组合",
                    component: "GSubForm",
                    componentProps: {
                        multiple: true,
                        schemas: [
                            {
                                field: "name",
                                label: "骰子类型",
                                component: "AutoComplete",
                                componentProps: {
                                    options: config.dice.presets.map(preset => ({
                                        label: preset.name,
                                        value: preset.name
                                    }))
                                },
                                required: true
                            },
                            {
                                field: "count",
                                label: "数量",
                                component: "InputNumber",
                                componentProps: {
                                    min: 1
                                },
                                required: true
                            }
                        ]
                    }
                }
            ]
        }
    }
]