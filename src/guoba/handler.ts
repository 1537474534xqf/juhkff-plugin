/**
 * @fileoverview: 锅巴配置更新生命周期
 */

import { autoSaveDailyReport, autoSaveEmotion, DAILY_REPORT_GENERATE, DAILY_REPORT_PUSH, deleteJob, EMOTION_GENERATE, pushDailyReport, upsertJobFromConfig } from "../bgProcess/jobs.js";
import { AutoReply, ChatApiType } from "../config/define/autoReply.js";
import { DailyReport } from "../config/define/dailyReport.js";
import { config, Config } from "../config/index.js";
import { agentMap, reloadInstance } from "../model/map.js";
import { Objects } from "../utils/kits.js";
import { EMOTION_KEY, removeSubKeys } from "../utils/redis.js";


export const transformDataToType = (data: [string, any][]) => {
    const result = {};

    for (const [key, value] of Object.entries(data)) {
        const keys = key.split('.');
        let current = result;

        for (let i = 0; i < keys.length; i++) {
            const part = keys[i];

            if (i === keys.length - 1) {
                // Last part - assign the value
                current[part] = value;
            } else {
                // Create nested object if it doesn't exist
                current[part] = current[part] || {};
                current = current[part];
            }
        }
    }

    return result;
};

/**
 * 更新前校验和处理
 * @param data 传入数据
 * @returns 
 */
export function beforeUpdate(data: Config) {
    if (data.autoReply.useAutoReply) {
        if (Objects.isNull(data.autoReply.chatApi))
            return { code: -1, message: "请选择有效的群聊AI接口" };
        if (Objects.isNull(data.autoReply.chatApiKey))
            return { code: -1, message: "请输入有效的群聊AI ApiKey" };
    }
    if (data.autoReply.useVisual) {
        if (Objects.isNull(data.autoReply.visualApi))
            return { code: -1, message: "请选择有效的视觉AI接口" };
        if (Objects.isNull(data.autoReply.visualApiKey))
            return { code: -1, message: "请输入有效的视觉AI ApiKey" };
    }
    if (data.autoReply.chatApiType.includes(ChatApiType.VISUAL)) {
        if (!agentMap[data.autoReply.chatApi].hasVisual()) return { code: -1, message: `${data.autoReply.chatApi}不支持视觉模型` }
        if (data.autoReply.useVisual) return { code: -1, message: "如要使用视觉AI接口，请先关闭常规接口的视觉类型" };
    }
    if (data.helpGen.manualList.some((item) =>
        Objects.isNull(item?.name?.trim()) && Objects.isNull(item?.command?.trim()) && Objects.isNull(item?.dsc?.trim()))
    ) {
        return { code: -1, message: "功能名称、调用格式和功能描述至少填写一项！" };
    }
    var helpGroupList = data.helpGen.manualList.filter((item) => item.type == "group").map((item) => item?.name.trim());
    if (helpGroupList.length > 0 && helpGroupList.some((name) => Objects.isNull(name))) {
        return { code: -1, message: "功能组名称不能为空，请检查" };
    }
    var helpSubList = data.helpGen.manualList.filter((item) => item.type == "sub").map((item) => item?.belongTo?.trim());
    if (helpSubList.length > 0) {
        if (helpSubList.some((sub) => Objects.isNull(sub))) {
            return { code: -1, message: "子功能所属功能组名称不能为空，请检查" };
        }
        if (helpSubList.some((sub) => !helpGroupList.includes(sub))) {
            return { code: -1, message: "子功能所属功能组不存在，请检查" };
        }
    }
    return { code: 0, message: "校验成功" };
}

/**
 * 更新后校验和处理
 * @param {*} previous 更新后配置
 * @returns code, message, data
 */
export function afterUpdate(previous: Config) {
    if (config.autoReply.useAutoReply) {
        if (Objects.isNull(config.autoReply.chatApi)) return { code: -1, message: "请选择有效的群聊AI接口" };
        if (Objects.isNull(config.autoReply.chatApiKey)) return { code: -1, message: "请输入有效的群聊AI ApiKey" };
    }
    if (config.autoReply.useVisual) {
        if (Objects.isNull(config.autoReply.visualApi)) return { code: -1, message: "请选择有效的视觉AI接口" };
        if (Objects.isNull(config.autoReply.visualApiKey)) return { code: -1, message: "请输入有效的视觉AI ApiKey" };
    }

    if (previous.autoReply.chatApi != config.autoReply.chatApi) {
        config.autoReply.chatModel = "";
    }
    // 因为实现逻辑和结构体不同，所以切换时删除之前的redis存储
    if (previous.autoReply.chatApiType.includes(ChatApiType.VISUAL) != config.autoReply.chatApiType.includes(ChatApiType.VISUAL)) {
        removeSubKeys("juhkff:auto_reply", [EMOTION_KEY]).then(() => { });
    }
    reloadInstance();
    reloadDailyReportJobs(previous.dailyReport);
    reloadEmotionGenerateJobs(previous.autoReply);
    return { code: 0, message: "校验成功" };
}

// ----------------------------------------------------- 定时任务-----------------------------------------------------

function reloadDailyReportJobs(previous: DailyReport) {
    if (config.dailyReport.useDailyReport) {
        if (config.dailyReport.push != previous.push || config.dailyReport.useDailyReport != previous.useDailyReport || config.dailyReport.dailyReportTime != previous.dailyReportTime) {
            if (config.dailyReport.push) {
                upsertJobFromConfig(DAILY_REPORT_PUSH, config.dailyReport.dailyReportTime, pushDailyReport);
            } else {
                deleteJob(DAILY_REPORT_PUSH);
            }
        }
        if (config.dailyReport.preHandle != previous.preHandle || config.dailyReport.useDailyReport != previous.useDailyReport || config.dailyReport.preHandleTime != previous.preHandleTime) {
            if (config.dailyReport.preHandle) {
                upsertJobFromConfig(DAILY_REPORT_GENERATE, config.dailyReport.preHandleTime, autoSaveDailyReport);
            } else {
                deleteJob(DAILY_REPORT_GENERATE);
            }
        }
    } else {
        deleteJob(DAILY_REPORT_PUSH);
        deleteJob(DAILY_REPORT_GENERATE);
    }
}

function reloadEmotionGenerateJobs(previous: AutoReply) {
    if (config.autoReply.useAutoReply) {
        if (config.autoReply.useEmotion != previous.useEmotion || config.autoReply.useAutoReply != previous.useAutoReply || config.autoReply.emotionGenerateTime != previous.emotionGenerateTime) {
            if (config.autoReply.useEmotion) {
                upsertJobFromConfig(EMOTION_GENERATE, config.autoReply.emotionGenerateTime, autoSaveEmotion);
            } else {
                deleteJob(EMOTION_GENERATE);
            }
        }
    } else {
        deleteJob(EMOTION_GENERATE);
    }
}