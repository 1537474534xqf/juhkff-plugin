import EventEmitter from "events";
// {属性名:{群号:值}}
export const groupDict = {};
// 定时任务 {name: Job}
export const jobDict = {};
// 事件总线
export const eventBus = new EventEmitter();
