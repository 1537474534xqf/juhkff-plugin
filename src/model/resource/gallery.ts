import chokidar, { FSWatcher } from "chokidar";
import fs from "fs";
import { getAllFiles } from "../../utils/tools.js";
import { PLUGIN_ROOT_DIR } from "../path.js";
import path from "path";

export const emojiGallery: string[] = [];

export function loadEmojiGallery(galleryPath: string): FSWatcher {
    var pathStr;
    if (galleryPath.indexOf("/") !== -1) {
        pathStr = galleryPath.split("/");
    } else {
        pathStr = galleryPath.split("\\");
    }
    galleryPath = path.join(PLUGIN_ROOT_DIR, ...pathStr);
    if (galleryPath === PLUGIN_ROOT_DIR) return null;
    if (!fs.existsSync(galleryPath) || !fs.lstatSync(galleryPath).isDirectory())
        fs.mkdirSync(galleryPath, { recursive: true });
    getAllFiles(galleryPath, emojiGallery);

    var watcher = chokidar.watch(galleryPath, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 1000
        }
    }).on("add", (path) => {
        if (fs.existsSync(path) && fs.lstatSync(path).isFile()) {
            emojiGallery.push(path);
            logger.info(`[JUHKFF-PLUGIN]表情图库新增文件：${path}`);
        }
    }).on("unlink", (path) => {
        const index = emojiGallery.indexOf(path);
        if (index > -1) {
            emojiGallery.splice(index, 1);
            logger.info(`[JUHKFF-PLUGIN]表情图库删除文件：${path}`);
        }
    }).on("error", (error) => {
        logger.error(`[JUHKFF-PLUGIN]表情图库监控异常`, error);
    });
    return watcher;
}