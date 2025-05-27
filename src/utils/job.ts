import { scheduleJob } from "node-schedule";
import { jobDict } from "../cache/global.js";
import { CronExpression } from "../types.js";

/**
 * 创建或更新定时任务
 * @param taskName 枚举值
 * @param taskCron Cron 表达式
 */
export function upsertJobFromConfig(taskName: string, taskCron: CronExpression, taskFunc: () => void | Promise<void>) {
    if (jobDict[taskName] && jobDict[taskName].reschedule(taskCron)) logger.info(`[JUHKFF-PLUGIN] 已修改定时任务 ${taskName}: ${taskCron}`);
    else {
        jobDict[taskName] = scheduleJob(taskName, taskCron, taskFunc);
        logger.info(logger.cyan(`- [JUHKFF-PLUGIN] 已设置定时任务 ${taskName}: ${taskCron}`));
    }
}

/**
 * 删除定时任务
 * @param taskName 任务名称
 */
export function deleteJob(taskName: string) {
    if (jobDict[taskName]) {
        jobDict[taskName].cancel();
        delete jobDict[taskName];
        logger.info(logger.cyan(`[JUHKFF-PLUGIN] 已删除定时任务${taskName}`));
    }
}