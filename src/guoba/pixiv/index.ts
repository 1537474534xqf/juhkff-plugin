import { ConfigSchemaType } from "../../types";

export const pixivSchema = (): ConfigSchemaType[] => [
    {
        label: "pixiv功能",
        // 第1个分组标记开始，无需标记结束
        component: "SOFT_GROUP_BEGIN",
    },
    {
        field: "pixiv.usePixiv",
        label: "开启pixiv功能",
        bottomHelpMessage: "开启后，可使用pixiv相关功能",
        component: "Switch",
    },
    {
        field: "pixiv.groupSubscribeToUserId",
        label: "群组订阅用户列表",
        bottomHelpMessage: "群组订阅用户列表，订阅用户列表中的用户，会自动将用户新图推送给相关群组",
        component: "GSubForm",
        componentProps: {
            multiple: true,
            schemas: [
                {
                    field: "userId",
                    label: "用户ID",
                    required: true,
                    component: "InputNumber",
                    componentProps: {
                        min: 0,
                        step: 1,
                    },
                },
                {
                    field: "groupIds",
                    label: "订阅群",
                    required: true,
                    component: "GSelectGroup",
                },
            ]
        }
    },
    {
        field: "pixiv.interval",
        label: "默认轮询间隔（分钟）",
        bottomHelpMessage: "默认轮询间隔，单位为分钟，默认为30分钟。修改此项需重启机器人",
        component: "InputNumber",
        componentProps: {
            placeholder: "请输入轮询间隔",
            min: 0,
            step: 1,
        },
    },
    {
        field: "pixiv.proxyUrl",
        label: "代理URL",
        bottomHelpMessage: "可选的代理URL，用于访问Pixiv API，留空则不使用代理",
        component: "Input",
    },
]