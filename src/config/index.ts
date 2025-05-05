/**
 * TODO 有新插件时需同步更新此处
 * @fileoverview 插件配置处理
 */
import { saveConfigToFile } from "./common.js"
import { DouBao, douBaoConfig, setDouBaoConfig } from "./define/ai/douBao.js"
import { AutoReply, autoReplyConfig, setAutoReplyConfig } from "./define/autoReply.js"
import { DailyReport, dailyReportConfig, setDailyReportConfig } from "./define/dailyReport.js"
import { EmojiSave, emojiSaveConfig, setEmojiSaveConfig } from "./define/emojiSave.js"
import { HelpGen, helpGenConfig, setHelpGenConfig } from "./define/helpGen.js"

export type ConfigType = AutoReply | DailyReport | EmojiSave | HelpGen | DouBao

export type Config = {
    autoReply: AutoReply
    dailyReport: DailyReport
    emojiSave: EmojiSave
    helpGen: HelpGen
    douBao: DouBao
}

// ! 一切配置项使用此处的值，切勿直接使用子目录下的xxxConfig!
export const config = {
    get autoReply() { return autoReplyConfig },
    get dailyReport() { return dailyReportConfig },
    get emojiSave() { return emojiSaveConfig },
    get helpGen() { return helpGenConfig },
    get douBao() { return douBaoConfig }
};

export function updateConfig(data: Config) {
    setAutoReplyConfig(data.autoReply);
    setDailyReportConfig(data.dailyReport);
    setEmojiSaveConfig(data.emojiSave);
    setHelpGenConfig(data.helpGen);
    setDouBaoConfig(data.douBao);

    saveConfigToFile(data.autoReply, "autoReply.yaml");
    saveConfigToFile(data.dailyReport, "dailyReport.yaml");
    saveConfigToFile(data.emojiSave, "emojiSave.yaml");
    saveConfigToFile(data.helpGen, "helpGen.yaml");
    saveConfigToFile(data.douBao, "ai", "douBao.yaml");
}