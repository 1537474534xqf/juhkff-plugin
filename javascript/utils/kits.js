import * as fileType from "file-type";
import ffmpeg from "fluent-ffmpeg";
import NodeID3 from "node-id3";
import path from "path";
import { groupDict } from "../cache/global.js";
/**
 * @description: 对象工具类
 */
export class Objects {
    /**
     * 判断对象是否为空，包括空字符串，空数组，空对象
     * @param {*} obj
     * @returns boolean
     */
    static isNull(obj) {
        if (!obj || obj === null || obj === undefined)
            return true;
        if (Array.isArray(obj)) {
            return obj.length === 0;
        }
        if (typeof obj === "string" || obj instanceof String) {
            return obj.trim() === "";
        }
        if (typeof obj === "object") {
            return Objects.allNull(...Object.values(obj));
        }
        return false;
    }
    /**
     * 判断多个对象中是否有空对象
     * @param objs
     * @returns
     */
    static hasNull(...objs) {
        return objs.some((obj) => Objects.isNull(obj));
    }
    static allNull(...objs) {
        return objs.every((obj) => Objects.isNull(obj));
    }
}
/**
 * @description: 字符串工具类
 */
export class StringUtils {
    /**
     * 首字母大写
     * @param {*} str
     * @returns string
     */
    static toUpperFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    static splitByMultiple(str, separators) {
        // 将每个分隔符转义，并用正则的“或”( | )连接
        const escaped = separators.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regexPattern = new RegExp(escaped.join('|'), 'g');
        return str.split(regexPattern);
    }
    static startsWithStrs(str, strs) {
        for (const s of strs) {
            if (str.startsWith(s)) {
                return true;
            }
        }
        return false;
    }
}
export class FileType {
    static getBase64ImageType(base64) {
        // 将Base64数据解码为二进制数据
        const binaryData = Buffer.from(base64, "base64");
        // 获取前几个字节作为魔数（magic number）
        const magicNumber = binaryData.subarray(0, 2).toString("hex").toUpperCase();
        // 根据魔数确定图片类型
        switch (magicNumber) {
            case "8950":
                return "data:image/png;base64,";
            case "FFD8":
                return "data:image/jpeg;base64,";
            case "4749":
                return "data:image/gif;base64,";
            case "424D":
                return "data:image/bmp;base64,";
            case "5249":
                return "data:image/webp;base64,";
            case "4949":
            case "4D4D":
                return "data:image/tiff;base64,";
            default:
                return null;
        }
    }
    static getImageTypeFromBase64(base64) {
        if (base64.startsWith("data:image/")) {
            return base64.split(";")[0].substring(5);
        }
        const base64Type = FileType.getBase64ImageType(base64);
        if (base64Type) {
            return "image/" + base64Type.split("/")[1].split(";")[0];
        }
        return null;
    }
    static getImageContentFromBase64(base64) {
        if (base64.startsWith("data:image/"))
            return base64.split(";base64,")[1];
        if (Objects.isNull(base64))
            return base64;
        return null;
    }
    static async getFileTypeFromBuffer(arrayBuffer) {
        return await fileType.fileTypeFromBuffer(arrayBuffer);
    }
}
export class AudioParse {
    /**
     * 解析字幕JSON并生成LRC和SRT格式的字幕
     * @param captionsJson 字幕JSON字符串
     * @returns 包含LRC和SRT字幕的对象
     */
    static parseCaptions(captionsJson) {
        const captions = JSON.parse(captionsJson);
        const lrcLines = [];
        const srtLines = [];
        const duration = captions.duration;
        let index = 1;
        for (const utterance of captions.utterances) {
            const startMs = Math.floor(utterance.start_time); // 转换为毫秒
            const endMs = Math.floor(utterance.end_time);
            const text = utterance.text;
            // 生成LRC格式行：[mm:ss.xx]text
            const lrcTimeStr = AudioParse.formatTimeLRC(startMs);
            const lrcLine = `[${lrcTimeStr}]${text}`;
            if (lrcLine) {
                lrcLines.push(lrcLine);
            }
            // 生成SRT格式块
            const srtStartTime = AudioParse.formatTimeSRT(startMs);
            const srtEndTime = AudioParse.formatTimeSRT(endMs);
            const srtBlock = `${index++}\n${srtStartTime} --> ${srtEndTime}\n${text}\n`;
            srtLines.push(srtBlock);
        }
        return {
            lrc: lrcLines.join('\n'),
            srt: srtLines.join('\n'),
            duration: duration
        };
    }
    /**
     * 格式化时间为LRC格式 (mm:ss.xx)
     * @param milliseconds 时间(毫秒)
     * @returns 格式化的时间字符串
     */
    static formatTimeLRC(ms) {
        const totalSecs = Math.floor(ms / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        const hundredths = Math.floor((ms % 1000) / 10);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
    }
    /**
     * 将毫秒转换为 SRT 字幕时间格式 (HH:MM:SS,mmm)
     * @param ms 毫秒时间戳（从0开始）
     * @returns SRT 格式的时间字符串，例如 "00:01:23,456"
     */
    static formatTimeSRT(ms) {
        const totalSecs = Math.floor(ms / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        const millis = ms % 1000;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
    }
    /**
     * 将音频文件转换为带字幕的MKV文件
     * @param audioPath 原音频文件路径
     * @param srtPath 字幕文件路径(.srt)
     * @param outputPath 可选输出路径
     */
    static async convertToMkvWithSubtitles(audioPath, srtPath, outputPath) {
        return new Promise((resolve, reject) => {
            const output = outputPath || path.join(path.dirname(audioPath), `${path.basename(audioPath, path.extname(audioPath))}.mkv`);
            ffmpeg(audioPath)
                .input(srtPath)
                .outputOptions([
                '-c:a copy', // 复制音频流
                '-c:s srt', // 对于MP4兼容性更好
                '-map 0', // 映射第一个输入(音频)
                '-map 1', // 映射第二个输入(字幕)
                '-metadata:s:s:0 language=chi',
                '-disposition:s:0 default' // 标记为默认字幕
            ])
                .output(output)
                .on('start', (commandLine) => {
                logger.info(`执行命令: ${commandLine}`);
            })
                .on('end', () => {
                logger.info(`MKV转换完成: ${output}`);
                resolve();
            })
                .on('error', (err) => {
                logger.error('MKV转换错误:', err);
                reject(err);
            })
                .on('progress', (progress) => {
                if (progress.percent && progress.currentFps) {
                    const percent = Math.min(100, Math.round(progress.percent));
                    logger.info(`MKV转换处理进度: ${percent}%`);
                }
            })
                .run();
        });
    }
    /**
     * 将音频文件转换为带字幕的MP4文件
     * @param audioPath 原音频文件路径
     * @param srtPath 字幕文件路径(.srt)
     * @param outputPath 可选输出路径
     */
    static async convertToMp4WithSubtitles(audioPath, srtPath, outputPath) {
        return new Promise((resolve, reject) => {
            const output = outputPath || path.join(path.dirname(audioPath), `${path.basename(audioPath, path.extname(audioPath))}.mp4`);
            ffmpeg(audioPath)
                .input(srtPath)
                .outputOptions([
                '-c:a copy', // 复制音频流
                '-c:s mov_text', // 使用 mov_text 格式嵌入字幕（适用于MP4）
                '-map 0', // 映射第一个输入(音频)
                '-map 1', // 映射第二个输入(字幕)
                '-metadata:s:s:0 language=chi', // 设置字幕语言
                '-disposition:s:0 default' // 默认启用该字幕轨道
            ])
                .output(output)
                .on('start', (commandLine) => {
                logger.info(`执行命令: ${commandLine}`);
            })
                .on('end', () => {
                logger.info(`MP4转换完成: ${output}`);
                resolve();
            })
                .on('error', (err) => {
                logger.error('MP4转换错误:', err);
                reject(err);
            })
                .on('progress', (progress) => {
                if (progress.percent && progress.currentFps) {
                    const percent = Math.min(100, Math.round(progress.percent));
                    logger.info(`MP4转换处理进度: ${percent}%`);
                }
            })
                .run();
        });
    }
    /**
     * 将音频文件转换为 MP3 格式
     * @param inputPath 输入文件路径
     * @param outputPath 输出 MP3 文件路径（可选）
     * @returns 输出文件路径
     */
    static async convertToMp3(inputPath, outputPath) {
        if (inputPath.endsWith('.mp3'))
            return new Promise((resolve) => resolve(inputPath));
        return new Promise((resolve, reject) => {
            // 如果没有指定输出路径，则使用相同目录，更改扩展名为.mp3
            const output = outputPath || path.join(path.dirname(inputPath), path.basename(inputPath, path.extname(inputPath)) + '.mp3');
            ffmpeg(inputPath)
                .audioCodec('libmp3lame') // 使用MP3编码器
                .audioBitrate(128) // 设置比特率（kbps）
                .output(output)
                .on('end', () => {
                logger.info(`转换完成: ${output}`);
                resolve(output);
            })
                .on('error', (err) => {
                logger.error('转换错误:', err);
                reject(err);
            })
                .on('progress', (progress) => {
                logger.info(`处理中: ${Math.round(progress.percent)}% 完成`);
            })
                .run();
        });
    }
    static writeLyricsToMP3(mp3FilePath, lrcContent, title = "AI Generated", language = 'chi') {
        // 准备要写入的字幕/歌词数据
        const lyrics = {
            language: language,
            text: lrcContent
        };
        const tags = {
            title: title,
            artist: "AI Generated",
            album: "AI Generated",
            unsynchronisedLyrics: lyrics, // 添加歌词/字幕
            // 可以添加其他ID3标签
        };
        // tags.uslt = {
        //     language: 'eng',
        //     descriptor: 'Embedded Lyrics',
        //     text: lrcContent
        // };
        // 写入标签到MP3文件
        const success = NodeID3.write(tags, mp3FilePath);
        if (!success) {
            logger.info(`❌ 跳过 ID3 歌词嵌入`);
        }
        else {
            logger.info('✅ 歌词已写入 MP3 文件');
        }
        return true;
    }
}
export class ChatKits {
    static replaceWithBotNickName(chatPrompt, group_id) {
        const botName = groupDict[group_id].botName;
        chatPrompt = chatPrompt.replace(/{{botName}}/g, `'${botName}'`);
        return chatPrompt;
    }
    static async saveGroupDict(e) {
        const groupMember = e.bot.pickMember(e.group_id, e.self_id);
        const botInfo = await groupMember.getInfo();
        const botName = botInfo?.card || botInfo?.nickname;
        const dict = { botName: botName };
        groupDict[e.group_id] = dict;
    }
}
export class Thread {
    // 定义 sleep 函数，用于异步延迟
    static sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    ;
}
