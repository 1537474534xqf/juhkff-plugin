import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";
import { loadEmojiGallery } from "../../model/resource/gallery.js";
import { Objects } from "../../utils/kits.js";

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
    emojiGalleryPath: string;
}

export const emojiSaveConfig: EmojiSave = {} as EmojiSave;
let watcher = null;

function reloadEmojiGallery(oldEmojiGalleryPath: string) {
    if (emojiSaveConfig.emojiGalleryPath !== oldEmojiGalleryPath) {
        if (Objects.isNull(emojiSaveConfig.emojiGalleryPath)) if (watcher) watcher.close();
        else watcher = loadEmojiGallery(emojiSaveConfig.emojiGalleryPath);
    }
}

(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `emojiSave.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `emojiSave.yaml`);
    if (configFolderCheck(file, defaultFile)) logger.info(`- [JUHKFF-PLUGIN] 创建表情包配置`);

    let lastHash: string = getFileHash(fs.readFileSync(file, "utf8"));
    let oldEmojiGalleryPath: string = null;

    const sync = (() => {
        const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as EmojiSave;
        const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8")) as EmojiSave;
        configSync(userConfig, defaultConfig);
        fs.writeFileSync(file, YAML.stringify(userConfig));
        Object.assign(emojiSaveConfig, userConfig);
        watcher = loadEmojiGallery(emojiSaveConfig.emojiGalleryPath);

        reloadEmojiGallery(oldEmojiGalleryPath);
        oldEmojiGalleryPath = emojiSaveConfig.emojiGalleryPath;
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as EmojiSave;
            Object.assign(emojiSaveConfig, userConfig);
        }
        func();
        return func;
    })();

    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash) return;
        sync();
        lastHash = hash;
        logger.info(logger.grey(`- [JUHKFF-PLUGIN] 同步表情偷取配置`));
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN] 表情偷取配置同步异常`, err) })
})();