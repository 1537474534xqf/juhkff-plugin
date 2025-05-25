import fs from "fs";
import { scheduleJob } from "node-schedule"
import { config } from "../config/index.js";
import { DAILY_REPORT_SAVE_PATH, dailyReport } from "../apps/dailyReport.js";
import { sleep } from "../common.js";
import { CronExpression, JobDict } from "../type.js";
import { sendChatRequest } from "../utils/handle.js";
import { EMOTION_KEY } from "../utils/redis.js";

export const DAILY_REPORT_GENERATE = "dailyReportGenerateJob";
export const DAILY_REPORT_PUSH = "dailyReportPushJob";
export const EMOTION_GENERATE = "emotionGenerateJob";
const jobDict: JobDict = {};

export async function pushDailyReport() {
    logger.info("推送日报");
    let imageBuffer = null;
    if (config.dailyReport.preHandle) {
        if (!fs.existsSync(DAILY_REPORT_SAVE_PATH)) await dailyReport.generateAndSaveDailyReport();
        imageBuffer = fs.readFileSync(DAILY_REPORT_SAVE_PATH);
    } else {
        imageBuffer = await dailyReport.generateDailyReport();
    }
    for (let i = 0; i < config.dailyReport.pushGroupList.length; i++) {
        // 添加延迟以防止消息发送过快
        setTimeout(async () => {
            const group = Bot.pickGroup(config.dailyReport.pushGroupList[i]);
            logger.info(`正在向群组 ${group.group_id} 推送新闻。`);
            await group.sendMsg([segment.image(imageBuffer)]);
        }, i * 1000);
    }
}

export async function autoSaveDailyReport() {
    logger.info("[JUHKFF-PLUGIN] 预处理 -> 生成日报")
    let doOnce = false;
    while (true) {
        try {
            await dailyReport.generateAndSaveDailyReport();
            doOnce = true;
            break;
        } catch (e) {
            if (!doOnce) {
                logger.error(e)
                doOnce = true;
            }
            // 休眠后循环执行
            sleep(config.dailyReport.preHandleRetryInterval * 1000)
        }
    }
    logger.info("[JUHKFF-PLUGIN] 预处理 -> 生成日报成功")
}

export async function emotionGenerate() {
    let model = config.autoReply.chatModel;
    var emotion = await sendChatRequest(null, config.autoReply.emotionGeneratePrompt, model, [], false);
    logger.info(`[JUHKFF-PLUGIN] 情感生成: ${emotion}`);
    return emotion;
}

export async function autoSaveEmotion() {
    const emotion = await emotionGenerate();
    redis.set(EMOTION_KEY, emotion, { EX: 24 * 60 * 60 });
}


/**
 * 创建或更新定时任务
 * @param taskName 枚举值
 * @param taskCron Cron 表达式
 */
export function upsertJobFromConfig(taskName: string, taskCron: CronExpression, taskFunc: () => void | Promise<void>) {
    if (jobDict[taskName] && jobDict[taskName].reschedule(taskCron)) logger.info(`[JUHKFF-PLUGIN] 已修改定时任务 ${taskName}: ${taskCron}`);
    else {
        jobDict[taskName] = scheduleJob(taskName, taskCron, taskFunc);
        logger.info(`- [JUHKFF-PLUGIN] 已设置定时任务 ${taskName}: ${taskCron}`);
    }
}

export function deleteJob(taskName: string) {
    if (jobDict[taskName]) {
        jobDict[taskName].cancel();
        delete jobDict[taskName];
        logger.info(`[JUHKFF-PLUGIN] 已删除定时任务${taskName}`);
    }
}

if (config.dailyReport.useDailyReport && config.dailyReport.push)
    upsertJobFromConfig(DAILY_REPORT_PUSH, config.dailyReport.dailyReportTime, pushDailyReport);
if (config.dailyReport.useDailyReport && config.dailyReport.preHandle)
    upsertJobFromConfig(DAILY_REPORT_GENERATE, config.dailyReport.preHandleTime, autoSaveDailyReport);
if (config.autoReply.useAutoReply && config.autoReply.useEmotion)
    upsertJobFromConfig(EMOTION_GENERATE, config.autoReply.emotionGenerateTime, autoSaveEmotion);