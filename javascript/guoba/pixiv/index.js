export const pixivSchema = () => [
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
                    field: "groupId",
                    label: "群组ID",
                    required: true,
                    component: "Input",
                },
                {
                    field: "userIds",
                    label: "订阅用户ID",
                    required: true,
                    component: "GSubForm",
                    componentProps: {
                        multiple: true,
                        schemas: [
                            {
                                field: "userId",
                                label: "用户ID",
                                required: true,
                                component: "InputNumber",
                            },
                        ],
                    },
                },
                {
                    field: "useSpecialInterval",
                    label: "单设轮询间隔",
                    bottomHelpMessage: "关闭时，使用默认轮询间隔开关",
                    component: "Switch",
                },
                {
                    field: "interval",
                    label: "轮询间隔(分钟)",
                    component: "InputNumber",
                    bottomHelpMessage: "轮询间隔，单位为分钟，使用该项需将上面的开关关闭",
                }
            ]
        }
    },
    {
        field: "pixiv.defaultInterval",
        label: "默认轮询间隔（分钟）",
        bottomHelpMessage: "默认轮询间隔，单位为分钟，默认为30分钟",
        component: "InputNumber",
        componentProps: {
            placeholder: "请输入轮询间隔",
            min: 0,
            step: 1,
        },
    }
];
//# sourceMappingURL=index.js.map