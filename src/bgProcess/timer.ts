import fs from "fs";
import path from "path";
import { PLUGIN_DATA_DIR } from "../model/path";


// 定义 sleep 函数，用于异步延迟
export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 定时检测并删除${workspaceFolder}/data/{any groupId}/video目录下的文件
 */
const cleanVideoCache: () => NodeJS.Timeout = () => {
    const internalFunc = () => {
        if (!fs.existsSync(PLUGIN_DATA_DIR)) return;
        try {
            const now = Date.now();
            const thirtyMinutesAgo = now - 30 * 60 * 1000;
            if (!fs.existsSync(PLUGIN_DATA_DIR)) return;
            fs.readdirSync(PLUGIN_DATA_DIR).forEach((dir) => {
                const dirPath = path.join(PLUGIN_DATA_DIR, dir);
                if (!fs.statSync(dirPath).isDirectory()) return;
                fs.readdirSync(dirPath).forEach((dir2) => {
                    const dirPath2 = path.join(dirPath, dir2);
                    if (!fs.statSync(dirPath2).isDirectory() || dir2 != "video") return;
                    fs.readdirSync(dirPath2).forEach((file) => {
                        const filePath = path.join(dirPath2, file);
                        const fileStat = fs.statSync(filePath);
                        if (fileStat.isFile() && fileStat.birthtimeMs < thirtyMinutesAgo) {
                            fs.unlinkSync(filePath);
                            logger.info(`已删除旧文件: ${filePath}`);
                        }
                    });
                });
            });
        } catch (err) {
            logger.error("清理任务执行出错:", err);
        }
    };

    // 程序启动时立即执行一次
    internalFunc();
    return setInterval(internalFunc, 30 * 60 * 1000);
}

process.on("exit", () => {
    clearInterval(cleanVideoTask);
});

export const cleanVideoTask = cleanVideoCache();

