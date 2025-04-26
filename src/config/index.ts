import douBao, { DouBao } from "./define/ai/douBao";
import autoReply, { AutoReply } from "./define/autoReply";
import dailyReport, { DailyReport } from "./define/dailyReport";
import emojiSave, { EmojiSave } from "./define/emojiSave";
import helpGen, { HelpGen } from "./define/helpGen";

export type ConfigType = AutoReply | DailyReport | EmojiSave | HelpGen | DouBao

export default {
    autoReply: autoReply,
    dailyReport: dailyReport,
    emojiSave: emojiSave,
    helpGen: helpGen,
    douBao: douBao,
};