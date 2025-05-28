import { JobDict } from "../types.js";

// {属性名:{群号:值}}
export const groupDict: Record<string, Record<string, string>> = {};

// 定时任务 {name: Job}
export const jobDict: JobDict = {};

// 事件总线 可直接使用 Bot
// export const eventBus = new EventEmitter();