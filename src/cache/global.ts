import { JobDict } from "../types/index.js";

// {属性名:{群号:值}}
export const groupDict: Record<string, Record<string, string>> = {};

// 定时任务 {name: Job}
export const jobDict: JobDict = {};

// 日报错误输出记录
export const dailyReportDict: Record<string, string> = {};

// pixiv 订阅字典
export const pixivSubscribeTimerDict: Record<number, NodeJS.Timeout> = {};

export const botId = Bot.uin.filter((item) => typeof item == "number")[0] || Bot.uin[0];

// 事件总线 可直接使用 Bot
// export const eventBus = new EventEmitter();