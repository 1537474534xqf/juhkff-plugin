/**
 * TODO 有新插件时需同步更新此处
 * @fileoverview 插件配置处理
 */

import { saveConfigToFile } from "./common.js"
import { DouBao, douBaoConfig } from "./define/ai/douBao.js"
import { AutoReply, autoReplyConfig } from "./define/autoReply.js"
import { DailyReport, dailyReportConfig } from "./define/dailyReport.js"
import { EmojiSave, emojiSaveConfig } from "./define/emojiSave.js"
import { HelpGen, helpGenConfig } from "./define/helpGen.js"
import _ from "lodash"

export type ConfigType = AutoReply | DailyReport | EmojiSave | HelpGen | DouBao

export type Config = {
    autoReply: AutoReply
    dailyReport: DailyReport
    emojiSave: EmojiSave
    helpGen: HelpGen
    douBao: DouBao
}

export const config: Config = {
    autoReply: autoReplyConfig,
    dailyReport: dailyReportConfig,
    emojiSave: emojiSaveConfig,
    helpGen: helpGenConfig,
    douBao: douBaoConfig,
}

export function updateConfig(data: Config) {
    saveConfigToFile(data.autoReply, "autoReply.yaml");
    saveConfigToFile(data.dailyReport, "dailyReport.yaml");
    saveConfigToFile(data.emojiSave, "emojiSave.yaml");
    saveConfigToFile(data.helpGen, "helpGen.yaml");
    saveConfigToFile(data.douBao, "ai", "douBao.yaml");

    config.autoReply = autoReplyConfig
    config.dailyReport = dailyReportConfig
    config.emojiSave = emojiSaveConfig
    config.helpGen = helpGenConfig
}