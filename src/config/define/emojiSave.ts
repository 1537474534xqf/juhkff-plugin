import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";

type GroupRate = {
    groupList: number[];
    replyRate: number;
    emojiRate: number;
}

export type EmojiSave = {
    useEmojiSave: boolean;
    groupRate: GroupRate[];
    defaultReplyRate: number;
    defaultEmojiRate: number;
    expireTimeInSeconds: number;
}

export let emojiSaveConfig: EmojiSave = null;
export function setEmojiSaveConfig(config: EmojiSave) {
    emojiSaveConfig = config;
}

(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `emojiSave.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `emojiSave.yaml`);
    if (configFolderCheck(file, defaultFile)) logger.info(`[JUHKFF-PLUGIN]创建表情包配置`);

    emojiSaveConfig = YAML.parse(fs.readFileSync(file, "utf8")) as EmojiSave;
    const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8")) as EmojiSave;

    let lastHash: string = getFileHash(fs.readFileSync(file, "utf8"));
    configSync(emojiSaveConfig, defaultConfig);
    fs.writeFileSync(file, YAML.stringify(emojiSaveConfig));


    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash) return;
        emojiSaveConfig = YAML.parse(content);
        lastHash = hash;
        logger.info(`[JUHKFF-PLUGIN]同步表情偷取配置`);
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]表情偷取同步配置异常`, err) })
})();