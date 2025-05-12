import path from "path";
import fs from "fs";
import { config } from "../../config/index.js";
import { Request, RequestBody } from "../../type.js";
import { Objects } from "../../utils/kits.js";
import { url2Base64 } from "../../utils/net.js";
import { processMessage } from "../../common.js";
import { PLUGIN_DATA_DIR } from "../../model/path.js";

export class siliconflow extends plugin {
    constructor() {
        super({
            name: "SiliconFlow",
            dsc: "siliconflow插件",
            event: "message",
            priority: 1,
            rule: [
                {
                    reg: "^#sf$",
                    fnc: "help",
                },
                {
                    reg: "^#视频生成.*",
                    fnc: "videoGenerate",
                },
                {
                    reg: "^#语音生成.*",
                    fnc: "voiceGenerate",
                }
            ]
        })
    }

    async help(e: { reply: (arg0: string) => any; }) {
        if (!config.sf.useSF) return false;
        var helpMsg = `可用指令：[]中为可选项，()中为解释说明`;
        if (config.sf.useVideoGenerate)
            helpMsg += `\n  #视频生成 文本|图片`;
        if (config.sf.useVoiceGenerate) {
            helpMsg += `\n  #语音生成 文本`;
        }
        await e.reply(helpMsg);
        return true;
    }

    async preCheck(e: { reply: (arg0: string) => any; }) {
        if (Objects.hasNull(config.sf.sfApiKey)) {
            await e.reply("请先设置SiliconFlow的ApiKey");
            return false;
        }
        return true;
    }

    async voiceGenerate(e: any) {
        if (!config.sf.useSF) return false;
        if (!config.sf.useVoiceGenerate) return false;
        if (Objects.isNull(config.sf.sfApiKey)) {
            await e.reply("请先设置apiKey");
            return true;
        }
        if (Objects.isNull(config.sf.voiceGenerateModel)) {
            await e.reply("请先设置要使用的模型");
            return true;
        }
        var msgList = await processMessage(e);
        var texts = msgList.texts;
        texts = texts.replace("#语音生成", "").trim();
        if (Objects.isNull(texts) && Objects.isNull(msgList.images)) {
            await e.reply("请添加文本");
            return true;
        }
        var request: Request = {
            url: config.sf.voiceGenerateUrl,
            options: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.sf.sfApiKey}`,
                },
                body: {
                    model: config.sf.voiceGenerateModel,
                    input: texts,
                    voice: config.sf.voiceGenerateCharacter
                },
            }
        };
        request.options.body = JSON.stringify(request.options.body);
        const response = await fetch(request.url, request.options as RequestInit);
        // 将response保存为mp3
        const arrayBuffer = await response.arrayBuffer();
        const outputPath = path.join(PLUGIN_DATA_DIR, e.group_id || e.user_id, `${Date.now()}-siliconflow.mp3`);
        // 确保目录存在
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // 写入文件
        fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
        // 发送文件
        await e.reply(segment.file(outputPath));
    }

    async videoGenerate(e: any) {
        if (!config.sf.useSF) return false;
        if (!config.sf.useVideoGenerate) return false;
        if (Objects.isNull(config.sf.sfApiKey)) {
            await e.reply("请先设置apiKey");
            return true;
        }
        if (Objects.isNull(config.sf.videoGenerateModel)) {
            await e.reply("请先设置要使用的模型");
            return true;
        }
        var msgList = await processMessage(e);
        var texts = msgList.texts;
        texts = texts.replace("#视频生成", "").trim();
        if (Objects.isNull(texts) && Objects.isNull(msgList.images)) {
            await e.reply("请添加描述文本或图片");
            return true;
        }
        var request: Request = {
            url: config.sf.videoGenerateUrl,
            options: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.sf.sfApiKey}`,
                },
                body: {
                    "model": config.sf.videoGenerateModel,
                    "prompt": texts
                },
            }
        };
        if (!Objects.isNull(msgList.images)) {
            (request.options.body as RequestBody).image = url2Base64(msgList.images[0]);
            (request.options.body as RequestBody).image_size = "1280x720";
        }
        request.options.body = JSON.stringify(request.options.body);
        let response = await fetch(request.url, request.options as RequestInit);
        let responseJson = await response.json();
        var id = responseJson.requestId;
        if (Objects.isNull(id)) {
            await e.reply("视频生成失败，请稍后再试");
            return true;
        }
        logger.info(`[sf]视频生成任务创建成功，requestId：${id}`);
        // 创建线程
        this.createTaskThread(e, id, this.handleCompleted, this.handleFailed);
        await e.reply("视频生成中，请稍等...");
        const intervalId = setInterval(async () => {
            let response = await fetch(config.sf.videoGenerateRequestUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.sf.sfApiKey}`,
                },
                body: JSON.stringify({
                    requestId: id
                })
            });
            let responseJson = await response.json();
            if (responseJson.status != "Succeed") {
                if (responseJson.status == "Failed") {
                    clearInterval(intervalId);
                    await e.reply(`视频生成失败：${responseJson?.reason}`);
                }
            } else {
                clearInterval(intervalId);
                await e.reply(`视频生成完成，视频地址：${responseJson?.results?.videos[0]?.url}`);
            }
        }, 5000);
        return true;
    }
}