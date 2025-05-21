import { config } from "../../config/index.js";
import { Objects } from "../../utils/kits.js";
import { url2Base64 } from "../../utils/net.js";
import { processMessage } from "../../common.js";
import { getVoiceGenerateCharacter } from "../../guoba/ai/siliconflow/handler.js";
export const help = () => {
    return {
        name: "SiliconFlow",
        type: "group",
        dsc: "接入SiliconFlow",
        enable: config.siliconflow.useSF,
        subMenu: [
            {
                name: "视频生成",
                type: "sub",
                command: "#视频生成[SF] 文本|图片",
                enable: config.siliconflow.useVideoGenerate,
            },
            {
                name: "语音生成",
                type: "sub",
                command: "#语音生成[SF] 文本",
                enable: config.siliconflow.useVoiceGenerate,
            },
            {
                name: "回复内容转语音",
                type: "sub",
                dsc: `概率: ${config.siliconflow.chatTransVoiceRate * 100}%`,
                enable: config.siliconflow.chatTransVoiceResponse
            }
        ]
    };
};
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
                    reg: "^#视频生成SF.*",
                    fnc: "videoGenerate",
                },
                {
                    reg: "^#语音生成.*",
                    fnc: "voiceGenerate",
                },
                {
                    reg: "^#语音生成SF.*",
                    fnc: "voiceGenerate",
                }
            ]
        });
    }
    async help(e) {
        if (!config.siliconflow.useSF)
            return false;
        var helpMsg = `可用指令：[]中为可选项，()中为解释说明`;
        if (config.siliconflow.useVideoGenerate)
            helpMsg += `\n  #视频生成[SF] 文本|图片`;
        if (config.siliconflow.useVoiceGenerate) {
            helpMsg += `\n  #语音生成[SF] 文本`;
        }
        await e.reply(helpMsg);
        return true;
    }
    async preCheck(e) {
        if (Objects.hasNull(config.siliconflow.sfApiKey)) {
            await e.reply("请先设置SiliconFlow的ApiKey");
            return false;
        }
        return true;
    }
    async voiceGenerate(e) {
        if (!config.siliconflow.useSF)
            return false;
        if (!config.siliconflow.useVoiceGenerate)
            return false;
        if (Objects.isNull(config.siliconflow.sfApiKey)) {
            await e.reply("请先设置apiKey");
            return true;
        }
        if (Objects.isNull(config.siliconflow.voiceGenerateModel)) {
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
        const request = siliconflow.generateVoiceRequest(texts);
        const response = await fetch(request.url, request.options);
        const arrayBuffer = await response.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString("base64");
        await e.reply(segment.record(`base64://${base64String}`));
        return true;
    }
    async videoGenerate(e) {
        if (!config.siliconflow.useSF)
            return false;
        if (!config.siliconflow.useVideoGenerate)
            return false;
        if (Objects.isNull(config.siliconflow.sfApiKey)) {
            await e.reply("请先设置apiKey");
            return true;
        }
        if (Objects.isNull(config.siliconflow.videoGenerateModel)) {
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
        var request = {
            url: config.siliconflow.videoGenerateUrl,
            options: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.siliconflow.sfApiKey}`,
                },
                body: {
                    "model": config.siliconflow.videoGenerateModel,
                    "prompt": texts
                },
            }
        };
        if (!Objects.isNull(msgList.images)) {
            request.options.body.image = url2Base64(msgList.images[0]);
            request.options.body.image_size = "1280x720";
        }
        request.options.body = JSON.stringify(request.options.body);
        let response = await fetch(request.url, request.options);
        let responseJson = await response.json();
        var id = responseJson.requestId;
        if (Objects.isNull(id)) {
            await e.reply("视频生成失败，请稍后再试");
            return true;
        }
        logger.info(`[sf]视频生成任务创建成功，requestId：${id}`);
        // 创建线程
        await e.reply("视频生成中，请稍等（siliconflow视频生成等待时间较长）...");
        const intervalId = setInterval(async () => {
            let response = await fetch(config.siliconflow.videoGenerateRequestUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.siliconflow.sfApiKey}`,
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
            }
            else {
                clearInterval(intervalId);
                await e.reply(`视频生成完成，视频地址：${responseJson?.results?.videos[0]?.url}`);
            }
        }, 5000);
        return true;
    }
    static generateVoiceRequest(texts) {
        var request = {
            url: config.siliconflow.voiceGenerateUrl,
            options: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.siliconflow.sfApiKey}`,
                },
                body: {
                    model: config.siliconflow.voiceGenerateModel,
                    input: texts,
                    voice: config.siliconflow.voiceGenerateCharacter
                },
            }
        };
        if (request.options.body.voice == "random") {
            const voices = getVoiceGenerateCharacter();
            const randomIndex = Math.floor(Math.random() * (voices.length - 1)); // 排除最后一项并随机选
            request.options.body.voice = voices[randomIndex].value;
        }
        request.options.body = JSON.stringify(request.options.body);
        return request;
    }
}
