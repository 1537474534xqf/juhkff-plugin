/**
 * TODO 有新插件时需同步更新此处
 * @fileoverview 插件配置处理
 */
import { Objects } from "../utils/kits.js"
import { saveConfigToFile } from "./common.js"
import { DouBao, douBaoConfig } from "./define/ai/douBao.js"
import { SiliconFlow, sfConfig } from "./define/ai/siliconflow.js"
import { AutoReply, autoReplyConfig } from "./define/autoReply.js"
import { DailyReport, dailyReportConfig } from "./define/dailyReport.js"
import { EmojiSave, emojiSaveConfig } from "./define/emojiSave.js"
import { HelpGen, helpGenConfig } from "./define/helpGen.js"
import { CommandPrompt, commandPromptConfig } from "./define/commandPrompt.js"
import { Dice, diceConfig } from "./define/dice.js"
import { Pixiv, pixivConfig } from "./define/pixiv.js"
import { Kits, kitsConfig } from "./define/kits.js"

export type ConfigType = AutoReply | DailyReport | EmojiSave | HelpGen | DouBao | SiliconFlow | CommandPrompt | Dice | Pixiv | Kits;

export type Config = {
    autoReply: AutoReply
    dailyReport: DailyReport
    emojiSave: EmojiSave
    helpGen: HelpGen
    douBao: DouBao
    siliconflow: SiliconFlow,
    commandPrompt: CommandPrompt,
    dice: Dice,
    pixiv: Pixiv,
    kits: Kits,
}

// 全局 config
export const config: Config = {
    autoReply: autoReplyConfig,
    dailyReport: dailyReportConfig,
    emojiSave: emojiSaveConfig,
    helpGen: helpGenConfig,
    douBao: douBaoConfig,
    siliconflow: sfConfig,
    commandPrompt: commandPromptConfig,
    dice: diceConfig,
    pixiv: pixivConfig,
    kits: kitsConfig,
};

export function updateConfig(data: Config) {
    processCron(data)

    saveConfigToFile(data.autoReply, "autoReply.yaml");
    saveConfigToFile(data.dailyReport, "dailyReport.yaml");
    saveConfigToFile(data.emojiSave, "emojiSave.yaml");
    saveConfigToFile(data.helpGen, "helpGen.yaml");
    saveConfigToFile(data.douBao, "ai", "douBao.yaml");
    saveConfigToFile(data.siliconflow, "ai", "siliconflow.yaml");
    saveConfigToFile(data.commandPrompt, "commandPrompt.yaml");
    saveConfigToFile(data.dice, "dice.yaml");
    saveConfigToFile(data.pixiv, "pixiv.yaml");
    saveConfigToFile(data.kits, "kits.yaml");
}

function processCron(data: Config) {
    if (!Objects.isNull(data.dailyReport.dailyReportTime))
        data.dailyReport.dailyReportTime = normalizeCron(data.dailyReport.dailyReportTime);
    if (!Objects.isNull(data.dailyReport.preHandleTime))
        data.dailyReport.preHandleTime = normalizeCron(data.dailyReport.preHandleTime);
    if (!Objects.isNull(data.autoReply.emotionGenerateTime))
        data.autoReply.emotionGenerateTime = normalizeCron(data.autoReply.emotionGenerateTime);
}

// node-schedule的cron表达式只支持6位
function normalizeCron(cron: string): string {
    const parts = cron.trim().split(/\s+/);
    if (parts.length === 7) {
        return parts.slice(0, 6).join(' '); // 去掉第七位
    }
    return cron;
}