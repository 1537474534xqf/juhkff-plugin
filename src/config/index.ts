import path from "path";
import fs from "fs";
import YAML from "yaml";
import { DouBao } from "./define/ai/douBao";
import { AutoReply } from "./define/autoReply";
import { DailyReport } from "./define/dailyReport";
import { EmojiSave } from "./define/emojiSave";
import { HelpGen } from "./define/helpGen";


export type ConfigType = AutoReply | DailyReport | EmojiSave | HelpGen | DouBao

// 获取对应数据文件
export function getData(folderPath: string, filename: any) {
    folderPath = path.join(this.dataPath, folderPath);
    try {
        if (!fs.existsSync(path.join(folderPath, `${filename}.yaml`))) {
            return false;
        }
        return YAML.parse(
            fs.readFileSync(path.join(folderPath, `${filename}.yaml`), "utf8")
        );
    } catch (error) {
        logger.error(`[${filename}]读取失败`, error);
        return false;
    }
}

// 递归获取目录下所有文件
export function getAllFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            this.getAllFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}