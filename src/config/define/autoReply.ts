import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { CronExpression } from "../../type.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";

export type AutoReply = {
    useAutoReply: boolean;
    attachUrlAnalysis: boolean;
    useContext: boolean;
    maxHistoryLength: number;
    chatApi: string;
    chatApiKey: string
    chatModel: string
    apiCustomUrl: string
    defaultChatRate: number
    defaultReplyAtBot: boolean
    groupChatRate: { groupList: number[], chatRate: number, replyAtBot: boolean }[];
    useVisual: boolean;
    visualReplaceChat: boolean;
    visualApi: string;
    visualApiKey: string;
    visualModel: string;
    visualApiCustomUrl: string;
    // textToPaintPrompt: string;
    chatPrompt: string;
    oldPrompt: string[];
    useEmotion: boolean;
    emotionGenerateTime: CronExpression;
    emotionGeneratePrompt: string;
}

export let autoReplyConfig: AutoReply = null;
export function setAutoReplyConfig(config: AutoReply) {
    autoReplyConfig = config;
}

(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `autoReply.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `autoReply.yaml`);
    if (configFolderCheck(file, defaultFile)) logger.info(`[JUHKFF-PLUGIN]创建主动群聊配置`);


    autoReplyConfig = YAML.parse(fs.readFileSync(file, "utf8")) as AutoReply;
    const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8")) as AutoReply;

    // 对预设单独处理，将旧预设自动更新为新预设
    if (defaultConfig.oldPrompt.includes(autoReplyConfig.chatPrompt.trim())) autoReplyConfig.chatPrompt = defaultConfig.chatPrompt;
    delete defaultConfig.oldPrompt;

    let lastHash: string = getFileHash(fs.readFileSync(file, "utf8"));
    configSync(autoReplyConfig, defaultConfig);
    fs.writeFileSync(file, YAML.stringify(autoReplyConfig));
    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash) return;
        autoReplyConfig = YAML.parse(content);
        lastHash = hash;
        logger.info(`[JUHKFF-PLUGIN]同步主动群聊配置`);
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]主动群聊同步配置异常`, err) })
})();
