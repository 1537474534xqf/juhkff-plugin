import fs from "fs";
import path from "path";
import { PLUGIN_DATA_DIR } from "../model/path.js";
/**
 * 定时检测并删除${workspaceFolder}/data/{any groupId}/video目录下的文件
 */
const cleanVideoCache = () => {
    const internalFunc = () => {
        if (!fs.existsSync(PLUGIN_DATA_DIR))
            return;
        try {
            const now = Date.now();
            const fifteenMinutesAgo = now - 15 * 60 * 1000;
            if (!fs.existsSync(PLUGIN_DATA_DIR))
                return;
            fs.readdirSync(PLUGIN_DATA_DIR).forEach((dir) => {
                const dirPath = path.join(PLUGIN_DATA_DIR, dir);
                if (!fs.statSync(dirPath).isDirectory())
                    return;
                fs.readdirSync(dirPath).forEach((dir2) => {
                    const dirPath2 = path.join(dirPath, dir2);
                    if (!fs.statSync(dirPath2).isDirectory() || dir2 != "video")
                        return;
                    fs.readdirSync(dirPath2).forEach((file) => {
                        const filePath = path.join(dirPath2, file);
                        const fileStat = fs.statSync(filePath);
                        if (fileStat.isFile() && fileStat.birthtimeMs < fifteenMinutesAgo) {
                            fs.unlinkSync(filePath);
                            logger.info(`已删除旧文件: ${filePath}`);
                        }
                    });
                });
            });
        }
        catch (err) {
            logger.error("清理任务执行出错:", err);
        }
    };
    // 程序启动时立即执行一次
    internalFunc();
    return setInterval(internalFunc, 15 * 60 * 1000);
};
export const cleanVideoTask = cleanVideoCache();
/**
 * 定时检测并删除${workspaceFolder}/data/{any groupId}/audio目录下的文件
 */
const cleanAudioCache = () => {
    const internalFunc = () => {
        if (!fs.existsSync(PLUGIN_DATA_DIR))
            return;
        try {
            const now = Date.now();
            const fifteenMinutesAgo = now - 15 * 60 * 1000;
            if (!fs.existsSync(PLUGIN_DATA_DIR))
                return;
            fs.readdirSync(PLUGIN_DATA_DIR).forEach((dir) => {
                const dirPath = path.join(PLUGIN_DATA_DIR, dir);
                if (!fs.statSync(dirPath).isDirectory())
                    return;
                fs.readdirSync(dirPath).forEach((dir2) => {
                    const dirPath2 = path.join(dirPath, dir2);
                    if (!fs.statSync(dirPath2).isDirectory() || dir2 != "audio")
                        return;
                    fs.readdirSync(dirPath2).forEach((file) => {
                        const filePath = path.join(dirPath2, file);
                        const fileStat = fs.statSync(filePath);
                        if (fileStat.isFile() && fileStat.birthtimeMs < fifteenMinutesAgo) {
                            fs.unlinkSync(filePath);
                            logger.info(`已删除旧文件: ${filePath}`);
                        }
                    });
                });
            });
        }
        catch (err) {
            logger.error("清理任务执行出错:", err);
        }
    };
    // 程序启动时立即执行一次
    internalFunc();
    return setInterval(internalFunc, 15 * 60 * 1000);
};
export const cleanAudioTask = cleanAudioCache();
process.on("exit", () => {
    clearInterval(cleanVideoTask);
    clearInterval(cleanAudioTask);
});
//# sourceMappingURL=timer.js.map