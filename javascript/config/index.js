/**
 * TODO 有新插件时需同步更新此处
 * @fileoverview 插件配置处理
 */
import { saveConfigToFile } from "./common.js";
import { douBaoConfig } from "./define/ai/douBao.js";
import { autoReplyConfig } from "./define/autoReply.js";
import { dailyReportConfig } from "./define/dailyReport.js";
import { emojiSaveConfig } from "./define/emojiSave.js";
import { helpGenConfig } from "./define/helpGen.js";
export const config = {
    autoReply: autoReplyConfig,
    dailyReport: dailyReportConfig,
    emojiSave: emojiSaveConfig,
    helpGen: helpGenConfig,
    douBao: douBaoConfig,
};
export function updateConfig(data) {
    saveConfigToFile(data.autoReply, "autoReply.yaml");
    saveConfigToFile(data.dailyReport, "dailyReport.yaml");
    saveConfigToFile(data.emojiSave, "emojiSave.yaml");
    saveConfigToFile(data.helpGen, "helpGen.yaml");
    saveConfigToFile(data.douBao, "ai", "douBao.yaml");
    config.autoReply = autoReplyConfig;
    config.dailyReport = dailyReportConfig;
    config.emojiSave = emojiSaveConfig;
    config.helpGen = helpGenConfig;
}
//# sourceMappingURL=index.js.map