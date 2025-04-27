import douBao, { DouBao } from "./define/ai/douBao.js";
import autoReply, { AutoReply } from "./define/autoReply.js";
import dailyReport, { DailyReport } from "./define/dailyReport.js";
import emojiSave, { EmojiSave } from "./define/emojiSave.js";
import helpGen, { HelpGen } from "./define/helpGen.js";

export type ConfigType = AutoReply | DailyReport | EmojiSave | HelpGen | DouBao

export default {
    autoReply: autoReply,
    dailyReport: dailyReport,
    emojiSave: emojiSave,
    helpGen: helpGen,
    douBao: douBao,
};