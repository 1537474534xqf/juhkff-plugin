// {属性名:{群号:值}}
export const groupDict = {};
// 定时任务 {name: Job}
export const jobDict = {};
// 日报错误输出记录
export const dailyReportDict = {};
// pixiv 订阅字典
export const pixivSubscribeTimerDict = {};
export const botId = Bot.uin.filter((item) => typeof item == "number")[0] || Bot.uin[0];
// 事件总线 可直接使用 Bot
// export const eventBus = new EventEmitter();
