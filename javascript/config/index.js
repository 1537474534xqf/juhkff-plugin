/**
 * TODO 有新插件时需同步更新此处
 * @fileoverview 插件配置处理
 */
import { Objects } from "../utils/kits.js";
import { saveConfigToFile } from "./common.js";
import { douBaoConfig } from "./define/ai/douBao.js";
import { sfConfig } from "./define/ai/siliconflow.js";
import { autoReplyConfig } from "./define/autoReply.js";
import { dailyReportConfig } from "./define/dailyReport.js";
import { emojiSaveConfig } from "./define/emojiSave.js";
import { helpGenConfig } from "./define/helpGen.js";
import { commandPromptConfig } from "./define/commandPrompt.js";
// 全局 config
export const config = {
    autoReply: autoReplyConfig,
    dailyReport: dailyReportConfig,
    emojiSave: emojiSaveConfig,
    helpGen: helpGenConfig,
    douBao: douBaoConfig,
    siliconflow: sfConfig,
    commandPrompt: commandPromptConfig
};
export function updateConfig(data) {
    processCron(data);
    saveConfigToFile(data.autoReply, "autoReply.yaml");
    saveConfigToFile(data.dailyReport, "dailyReport.yaml");
    saveConfigToFile(data.emojiSave, "emojiSave.yaml");
    saveConfigToFile(data.helpGen, "helpGen.yaml");
    saveConfigToFile(data.douBao, "ai", "douBao.yaml");
    saveConfigToFile(data.siliconflow, "ai", "siliconflow.yaml");
    saveConfigToFile(data.commandPrompt, "commandPrompt.yaml");
}
function processCron(data) {
    if (!Objects.isNull(data.dailyReport.dailyReportTime))
        data.dailyReport.dailyReportTime = normalizeCron(data.dailyReport.dailyReportTime);
    if (!Objects.isNull(data.dailyReport.preHandleTime))
        data.dailyReport.preHandleTime = normalizeCron(data.dailyReport.preHandleTime);
    if (!Objects.isNull(data.autoReply.emotionGenerateTime))
        data.autoReply.emotionGenerateTime = normalizeCron(data.autoReply.emotionGenerateTime);
}
// node-schedule的cron表达式只支持6位
function normalizeCron(cron) {
    const parts = cron.trim().split(/\s+/);
    if (parts.length === 7) {
        return parts.slice(0, 6).join(' '); // 去掉第七位
    }
    return cron;
}
//# sourceMappingURL=index.js.map