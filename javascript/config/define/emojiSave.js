import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";
import { loadEmojiGallery } from "../../model/resource/gallery.js";
import { Objects } from "../../utils/kits.js";
export const emojiSaveConfig = {};
let watcher = null;
function reloadEmojiGallery(oldEmojiGalleryPath) {
    if (emojiSaveConfig.emojiGalleryPath !== oldEmojiGalleryPath) {
        if (Objects.isNull(emojiSaveConfig.emojiGalleryPath))
            if (watcher)
                watcher.close();
            else
                watcher = loadEmojiGallery(emojiSaveConfig.emojiGalleryPath);
    }
}
(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `emojiSave.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `emojiSave.yaml`);
    if (configFolderCheck(file, defaultFile))
        logger.info(`[JUHKFF-PLUGIN]创建表情包配置`);
    let lastHash = getFileHash(fs.readFileSync(file, "utf8"));
    let oldEmojiGalleryPath = null;
    const sync = (() => {
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8"));
            const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8"));
            configSync(userConfig, defaultConfig);
            Object.assign(emojiSaveConfig, userConfig);
            watcher = loadEmojiGallery(emojiSaveConfig.emojiGalleryPath);
            reloadEmojiGallery(oldEmojiGalleryPath);
            oldEmojiGalleryPath = emojiSaveConfig.emojiGalleryPath;
        };
        func();
        return func;
    })();
    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash)
            return;
        sync();
        lastHash = hash;
        logger.info(logger.grey(`[JUHKFF-PLUGIN]同步表情偷取配置`));
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]表情偷取配置同步异常`, err); });
})();
//# sourceMappingURL=emojiSave.js.map