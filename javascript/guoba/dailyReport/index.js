export const dailyReportSchema = () => [
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
        bottomHelpMessage: "如果发现无法生成图片时需填写该接口。填写内容：在https://admin.alapi.cn/user/login登录后，进入“我的API”获取token",
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
        bottomHelpMessage: "秒[0,59] 分钟[0,59] 小时[0,23] 日期[1,31] 月份[1,12] 星期[0,7/SUN,SAT]",
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
];
//# sourceMappingURL=index.js.map