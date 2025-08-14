import { ConfigSchemaType } from "../../types";

export const kitsSchema = (): ConfigSchemaType[] => [
    {
        label: "小工具",
        // 第1个分组标记开始，无需标记结束
        component: "SOFT_GROUP_BEGIN",
    },
    {
        field: "kits.useShareAnalyse",
        label: "开启分享链接内容解析",
        bottomHelpMessage: "开启后，当PC端QQ用户无法直接看到分享内容时，可以看机器人发的解析内容进行简单了解",
        component: "Switch",
    },
]