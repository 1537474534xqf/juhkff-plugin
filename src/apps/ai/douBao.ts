
import path from "path";
import fs from "fs";
import { getServiceApi } from "../../ai/doubao/api.js";
import { segment } from "oicq";
// @ts-ignore
import fastImageSize from "fast-image-size";
import { PLUGIN_DATA_DIR } from "../../model/path.js";
import { AudioParse, FileType, Objects } from "../../utils/kits.js";
import { Request, RequestBody, RequestMsg } from "../../type.js";
import { downloadFile, url2Base64 } from "../../utils/net.js";
import { config } from "../../config/index.js";
import { processMessage } from "../../common.js";

export class douBao extends plugin {
    constructor() {
        super({
            name: "豆包",
            dsc: "豆包",
            event: "message",
            priority: 1,
            rule: [
                {
                    reg: "^#豆包$",
                    fnc: "help",
                },
                {
                    // 匹配以 #视频生成 开头的消息
                    reg: "^#视频生成.*",
                    fnc: "videoGenerate",
                },
                {
                    // 匹配以 #视频生成 开头的消息
                    reg: "^#视频生成豆包.*",
                    fnc: "videoGenerate",
                },
                {
                    // 匹配以 #图片生成 开头的消息
                    reg: "^#图片生成.*",
                    fnc: "imageGenerate",
                },
                {
                    // 匹配以 #图片生成 开头的消息
                    reg: "^#图片生成豆包.*",
                    fnc: "imageGenerate",
                },
                {
                    // 匹配以 #图片风格化 开头的消息
                    reg: "^#图片风格化.*",
                    fnc: "imageStyle",
                },
                {
                    // 匹配以 #图片风格化 开头的消息
                    reg: "^#图片风格化豆包.*",
                    fnc: "imageStyle",
                },
                {
                    reg: "^#图片模仿.*",
                    fnc: "imageImitate",
                },
                {
                    reg: "^#图片模仿豆包.*",
                    fnc: "imageImitate",
                },
                {
                    reg: "^#歌词生成.*",
                    fnc: "lyricsGenerate",
                },
                {
                    reg: "^#歌词生成豆包.*",
                    fnc: "lyricsGenerate",
                },
                {
                    reg: "^#歌曲生成.*",
                    fnc: "songGenerate",
                },
                {
                    reg: "^#歌曲生成豆包.*",
                    fnc: "songGenerate"
                }
            ],
        });

        // ---------------------------------------------------- ServiceApi ----------------------------------------------------
        if (config.douBao.useImageStyle || config.douBao.useImageImitate) {
            this.fetchImageService = getServiceApi(
                config.douBao.imageService.host,
                config.douBao.imageService.accessKeyId,
                config.douBao.imageService.secretAccessKey,
                "POST",
                config.douBao.imageService.action,
                config.douBao.imageService.version,
                config.douBao.imageService.region,
                config.douBao.imageService.service
            );
        }
        /*
        if (config.douBao.useLyricsGenerate) {
            this.fetchLyricsGenerate = getServiceApi(
                config.douBao.songService.host,
                config.douBao.songService.accessKeyId,
                config.douBao.songService.secretAccessKey,
                "POST",
                config.douBao.lyricsGenerate.action,
                config.douBao.lyricsGenerate.version,
                config.douBao.songService.region,
                config.douBao.songService.service
            );
        }
        */
        if (config.douBao.useSongGenerate) {
            this.fetchSongGenerate = getServiceApi(
                config.douBao.songService.host,
                config.douBao.songService.accessKeyId,
                config.douBao.songService.secretAccessKey,
                "POST",
                config.douBao.songGenerate.action,
                config.douBao.songGenerate.version,
                config.douBao.songService.region,
                config.douBao.songService.service
            );
            this.fetchSongQuery = getServiceApi(
                config.douBao.songService.host,
                config.douBao.songService.accessKeyId,
                config.douBao.songService.secretAccessKey,
                "POST",
                config.douBao.songGenerate.queryAction,
                config.douBao.songGenerate.queryVersion,
                config.douBao.songService.region,
                config.douBao.songService.service
            )
        }
        // --------------------------------------------------------------------------------------------------------------------
    }

    async help(e: { reply: (arg0: string) => any; }) {
        if (!config.douBao.useDouBao) return false;
        var helpMsg = `可用指令：[]中为可选项，()中为解释说明`;
        if (config.douBao.useVideoGenerate)
            helpMsg += `\n  #视频生成[豆包] 文本|图片`;
        if (config.douBao.useImageGenerate) {
            helpMsg += `\n  #图片生成[豆包] 文本`;
        }
        if (config.douBao.useImageImitate) {
            helpMsg += `\n  #图片模仿[豆包] 文本 图片`;
        }
        if (config.douBao.useImageStyle) {
            helpMsg += `\n  #图片风格化[豆包] 类型前缀 图片`;
            helpMsg += `\n  #图片风格化[豆包] 类型列表`;
        }
        /*
        if (config.douBao.useLyricsGenerate) {
            helpMsg += `\n  #歌词生成[豆包] 提示词 [-g曲风] [-m歌词风格] [-sFemale|Male]`;
            helpMsg += `\n  #歌词生成[豆包] 曲风查询`;
            helpMsg += `\n  #歌词生成[豆包] 歌词风格查询`;
        }
        */
        if (config.douBao.useSongGenerate) {
            helpMsg += `\n  #歌曲生成[豆包] [-l歌词|-p提示词] [-g曲风] [-m歌曲风格] [-sFemale|Male] [-t音色] [-d时长(30-240)]`;
            helpMsg += `\n  #歌曲生成[豆包] 曲风查询`;
            helpMsg += `\n  #歌曲生成[豆包] 歌曲风格查询`;
            helpMsg += `\n  #歌曲生成[豆包] 音色查询`;
        }
        await e.reply(helpMsg);
        return true;
    }

    // ------------------------------------------------ 图片服务通用检查 -------------------------------------------------
    async preCheck(e: { reply: (arg0: string) => any; }): Promise<boolean> {
        if (
            Objects.hasNull(
                config.douBao.imageService.accessKeyId,
                config.douBao.imageService.secretAccessKey
            ) && Objects.hasNull(
                config.douBao.songService.accessKeyId,
                config.douBao.songService.secretAccessKey
            )
        ) {
            await e.reply("请先设置accessKeyId和secretAccessKey");
            return false;
        }
        return true;
    }

    get SuccessCode() {
        return 10000;
    }
    // --------------------------------------------------- 图片风格化 ---------------------------------------------------

    get imageStyleReqKeyMap(): Record<string, string> {
        var reqKeyList = config.douBao.imageStyle.reqKeyMap;
        var reqKeyMap: Record<string, string> = {};
        reqKeyList.forEach((item) => {
            reqKeyMap[item.key] = item.value;
        });
        return reqKeyMap;
    }

    get iamgeStyleSubReqKeyMap(): Record<string, string> {
        var subReqKeyList = config.douBao.imageStyle.subReqKeyMap;
        var subReqKeyMap: Record<string, string> = {};
        subReqKeyList.forEach((item) => {
            subReqKeyMap[item.key] = item.value;
        });
        return subReqKeyMap;
    }

    async imageStyle(e: any) {
        if (!config.douBao.useDouBao) return false;
        if (!config.douBao.useImageStyle) return false;
        if (!await this.preCheck(e)) return true;
        let result = await processMessage(e);
        var body: RequestBody = {};
        // 将指令部分去除并切分
        result.texts = result.texts.replace(/^#图片风格化豆包/, "").trim();
        let strList = result.texts.replace(/^#图片风格化/, "").trim().split(/\s+/);
        // 查询类型列表命令
        if (strList.length == 1 && strList[0] == "类型列表") {
            var typeList = Object.keys(this.imageStyleReqKeyMap);
            var typeMsg = "可用类型列表：";
            typeList.forEach((item) => {
                typeMsg += `    ${item}`;
            });
            await e.reply(typeMsg);
            return true;
        }
        if (Objects.isNull(result.images)) {
            // 纯文本
            await e.reply("请发送图片");
            return true;
        }
        // 官方目前仅支持一张图片
        if (Objects.isNull(strList) || strList.length != 1 || result.images.length != 1) {
            await e.reply("请遵循格式 #图片风格化 类型 图片");
            return true;
        }
        var type = strList[0];
        // 寻找匹配类型前缀
        var typeList = Object.keys(this.imageStyleReqKeyMap);
        typeList = typeList.filter((item) => {
            return item.startsWith(type);
        });
        if (Objects.isNull(typeList)) {
            await e.reply("请输入有效类型前缀");
            return true;
        }
        if (typeList.length > 1) {
            await e.reply("匹配到多个类型，请输入更精确的前缀");
            return true;
        }
        type = typeList[0];
        body.req_key = this.imageStyleReqKeyMap[type];
        if (!Objects.isNull(this.iamgeStyleSubReqKeyMap[type]))
            body.sub_req_key = this.iamgeStyleSubReqKeyMap[type];
        body.image_urls = result.images;
        body.return_url = config.douBao.imageStyle.returnUrl;
        await e.reply("正在生成图片，请稍等...");
        var response = await this.fetchImageService(body, { timeout: 0 });
        if (response?.ResponseMetadata?.Error) {
            await e.reply(`生成图片失败: ${response?.ResponseMetadata?.Error?.Code}. ${response?.ResponseMetadata?.Error?.Message}`);
            return true;
        }
        if (response.status === this.SuccessCode) {
            var segments = [];
            if (!Objects.isNull(response.data.binary_data_base64)) {
                response.data.binary_data_base64.forEach((base64: string) => {
                    if (!base64.startsWith("data:image/"))
                        segments.push(segment.image(FileType.getBase64ImageType(base64) + base64));
                    else segments.push(segment.image(base64));
                });
            }
            if (!Objects.isNull(response.data.image_urls))
                segments.push(response.data.image_urls.join("\n"));
            await e.reply(segments);
        } else {
            await e.reply(`生成图片失败:${response.message}`);
        }
        return true;
    }

    // ---------------------------------------------------- 图片模仿 ----------------------------------------------------
    async imageImitate(e: any) {
        if (!config.douBao.useDouBao) return false;
        if (!config.douBao.useImageImitate) return false;
        if (!await this.preCheck(e)) return true;
        var result = await processMessage(e);
        var body: RequestBody = {};
        // 将指令部分去除
        result.texts = result.texts.replace(/^#图片模仿豆包/, "").trim();
        result.texts = result.texts.replace(/^#图片模仿/, "").trim();
        var strList = result.texts.split(/\s+/);
        var width = null, height = null;
        for (var i = 0; i < strList.length - 1; i++) {
            if (strList[i].startsWith("-w")) {
                width = parseInt(strList[i + 1]);
            } else if (strList[i].startsWith("-h")) {
                height = parseInt(strList[i + 1]);
            }
        }
        if (!Objects.isNull(width)) body.width = width;
        if (!Objects.isNull(height)) body.height = height;
        if (Objects.isNull(result.images)) {
            // 纯文本
            await e.reply("请发送图片");
            return true;
        }
        body.req_key = config.douBao.imageImitate.reqKey;
        body.image_urls = result.images;
        body.prompt = result.texts;
        if (!Objects.isNull(config.douBao.imageImitate.returnUrl))
            body.return_url = config.douBao.imageImitate.returnUrl;
        if (!Objects.isNull(config.douBao.imageImitate.useSr))
            body.use_sr = config.douBao.imageImitate.useSr;
        await e.reply("正在生成图片，请稍等...");
        var response = await this.fetchImageService(body, { timeout: 0 });
        if (response?.ResponseMetadata?.Error) {
            await e.reply(`生成图片失败: ${response?.ResponseMetadata?.Error?.Code}. ${response?.ResponseMetadata?.Error?.Message}`);
            return true;
        }
        if (response.status === this.SuccessCode) {
            var segments = [];
            if (!Objects.isNull(response.data.binary_data_base64)) {
                response.data.binary_data_base64.forEach((base64: string) => {
                    if (!base64.startsWith("data:image/"))
                        segments.push(segment.image(FileType.getBase64ImageType(base64) + base64));
                    else segments.push(segment.image(base64));
                });
            }
            if (!Objects.isNull(response.data.image_urls))
                segments.push(response.data.image_urls.join("\n"));
            await e.reply(segments);
        } else {
            await e.reply(`生成图片失败:${response.message}`);
        }
    }
    // ---------------------------------------------------- 图片生成 ----------------------------------------------------

    static imageGenerateMap: Record<string, Record<string, string>> = {
        "doubao-seedream": {
            "text": "doubao-seedream-3-0-t2i-250415"
        }
    }

    static getImageGenerateModel(msgList: RequestMsg): string {
        if (msgList.images.length > 1) {
            if (!Objects.isNull(this.imageGenerateMap[config.douBao.imageGenerate.model]?.["image_2"])) {
                return this.imageGenerateMap[config.douBao.imageGenerate.model]?.["image_2"];
            } else if (!Objects.isNull(this.imageGenerateMap[config.douBao.imageGenerate.model]?.["image_1"])) {
                return this.imageGenerateMap[config.douBao.imageGenerate.model]?.["image_1"];
            } else {
                return config.douBao.imageGenerate.model;
            }
        } else if (msgList.images.length == 1) {
            if (!Objects.isNull(this.imageGenerateMap[config.douBao.imageGenerate.model]?.["image_1"])) {
                return this.imageGenerateMap[config.douBao.imageGenerate.model]?.["image_1"];
            } else if (!Objects.isNull(this.imageGenerateMap[config.douBao.imageGenerate.model]?.["image_2"])) {
                return this.imageGenerateMap[config.douBao.imageGenerate.model]?.["image_2"];
            } else {
                return config.douBao.imageGenerate.model;
            }
        } else if (!Objects.isNull(msgList.texts)) {
            if (!Objects.isNull(this.imageGenerateMap[config.douBao.imageGenerate.model]?.["text"])) {
                return this.imageGenerateMap[config.douBao.imageGenerate.model]?.["text"];
            } else {
                return config.douBao.imageGenerate.model;
            }
        } else {
            return config.douBao.imageGenerate.model;
        }
    }

    async imageGenerate(e: any) {
        if (!config.douBao.useDouBao) return false;
        if (!config.douBao.useImageGenerate) return false;
        if (!await this.preCheck(e)) return true;
        var msgList = await processMessage(e);
        // 将指令部分去除
        msgList.texts = msgList.texts.replace(/^#图片生成豆包/, "").trim();
        msgList.texts = msgList.texts.replace(/^#图片生成/, "").trim();
        if (msgList.images.length > 0) {
            await e.reply("当前功能仅支持文本生成图片");
            return true;
        }
        var request: Request = {
            url: config.douBao.imageGenerate.url,
            options: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.douBao.apiKey}`,
                },
                body: {
                    model: douBao.getImageGenerateModel(msgList),
                    prompt: msgList.texts,
                    response_format: "b64_json",
                    size: config.douBao.imageGenerate.size,
                    seed: config.douBao.imageGenerate.seed,
                    guidance_scale: config.douBao.imageGenerate.guidance_scale,
                    watermark: config.douBao.imageGenerate.watermark,
                }
            }
        };
        request.options.body = JSON.stringify(request.options.body);
        let response = await fetch(request.url, request.options as RequestInit);
        let responseJson = await response.json();
        if (Objects.isNull(responseJson?.error?.code)) {
            var segments = [];
            if (!Objects.isNull(responseJson.data)) {
                // 其实只会返回一张图，但就这样吧，挺好的
                responseJson.data.forEach((obj: any) => {
                    var base64 = obj.b64_json;
                    if (!Objects.isNull(base64)) {
                        if (!base64.startsWith("data:image/"))
                            segments.push(segment.image(FileType.getBase64ImageType(base64) + base64));
                        else segments.push(segment.image(base64));
                    }
                    if (!Objects.isNull(obj.url)) {
                        segments.push(obj.url);
                    }
                });
                await e.reply(segments);
            } else {
                await e.reply("生成图片失败: " + responseJson);
            }
        } else {
            await e.reply(`生成图片失败: ${responseJson.error.message}`);
        }
    }

    // ---------------------------------------------------- 视频生成 ----------------------------------------------------

    static videoGenerateMap: Record<string, Record<string, string>> = {
        "doubao-seedance": {
            "text": "doubao-seedance-1-0-lite-t2v-250428",
            "image_1": "doubao-seedance-1-0-lite-i2v-250428"
        },
        "wan2.1": {
            "text": "wan2-1-14b-t2v-250225",
            "image_1": "wan2-1-14b-i2v-250225",
            "image_2": "wan2-1-14b-flf2v-250417"
        },
        "doubao-seaweed": {
            "text": "doubao-seaweed-241128",
            "image_1": "doubao-seaweed-241128"
        }
    }

    static getVideoGenerateModel(msgList: RequestMsg): string {
        if (msgList.images.length > 1) {
            if (!Objects.isNull(this.videoGenerateMap[config.douBao.videoGenerate.model]?.["image_2"])) {
                return this.videoGenerateMap[config.douBao.videoGenerate.model]?.["image_2"];
            } else if (!Objects.isNull(this.videoGenerateMap[config.douBao.videoGenerate.model]?.["image_1"])) {
                return this.videoGenerateMap[config.douBao.videoGenerate.model]?.["image_1"];
            } else {
                return config.douBao.videoGenerate.model;
            }
        } else if (msgList.images.length == 1) {
            if (!Objects.isNull(this.videoGenerateMap[config.douBao.videoGenerate.model]?.["image_1"])) {
                return this.videoGenerateMap[config.douBao.videoGenerate.model]?.["image_1"];
            } else if (!Objects.isNull(this.videoGenerateMap[config.douBao.videoGenerate.model]?.["image_2"])) {
                return this.videoGenerateMap[config.douBao.videoGenerate.model]?.["image_2"];
            } else {
                return config.douBao.videoGenerate.model;
            }
        } else if (!Objects.isNull(msgList.texts)) {
            if (!Objects.isNull(this.videoGenerateMap[config.douBao.videoGenerate.model]?.["text"])) {
                return this.videoGenerateMap[config.douBao.videoGenerate.model]?.["text"];
            } else {
                return config.douBao.videoGenerate.model;
            }
        } else {
            return config.douBao.videoGenerate.model;
        }
    }


    async videoGenerate(e: any) {
        if (!config.douBao.useDouBao) return false;
        if (!config.douBao.useVideoGenerate) return false;
        if (Objects.isNull(config.douBao.apiKey)) {
            await e.reply("请先设置apiKey");
            return true;
        }
        if (Objects.isNull(config.douBao.videoGenerate.url)) {
            await e.reply("请先设置请求地址");
            return true;
        }
        if (Objects.isNull(config.douBao.videoGenerate.model)) {
            await e.reply("请先设置要使用的模型");
            return true;
        }
        var msgList = await processMessage(e);
        var texts = msgList.texts;
        texts = texts.replace("#视频生成豆包", "").trim();
        texts = texts.replace("#视频生成", "").trim();
        if (Objects.isNull(texts) && Objects.isNull(msgList.images)) {
            await e.reply("请添加描述文本或图片");
            return true;
        }
        var request: Request = {
            url: config.douBao.videoGenerate.url,
            options: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.douBao.apiKey}`,
                },
                body: {
                    model: douBao.getVideoGenerateModel(msgList),
                    content: [],
                }
            }
        };

        let imgIndex = 0;
        for (var i = 0; i < msgList.content.length; i++) {
            var content = msgList.content[i];
            if (content.type == "text") {
                (request.options.body as RequestBody).content.push({
                    type: "text",
                    text: content.text,
                });
            } else if (content.type == "image") {
                (request.options.body as RequestBody).content.push({
                    type: "image_url",
                    image_url: {
                        url: await url2Base64(content.url as string),
                    },
                    role: imgIndex === 0 ? "first_frame" : imgIndex === 1 ? "last_frame" : undefined
                });
                imgIndex++;
            } else {
                // 其它类型，保持原样加进body，虽然不知道有什么用，反正应该走不到这
                (request.options.body as RequestBody).content.push(content);
            }
        }
        request.options.body = JSON.stringify(request.options.body);
        let response = await fetch(request.url, request.options as RequestInit);
        let responseJson = await response.json();
        var id = responseJson.id;
        if (Objects.isNull(id)) {
            await e.reply(`视频生成失败: ${responseJson.error.code}, ${responseJson.error.message}`);
            return true;
        }
        logger.info(`[douBao]视频生成任务创建成功，id：${id}`);
        // 创建线程
        this.createTaskThread(e, id, this.handleCompleted, this.handleFailed);
        await e.reply("视频生成中，请稍等...");
        return true;
    }

    createTaskThread(e: any, id: string, successHandler?: (e: any, responseJson: any) => void, failHandler?: (e: any, responseJson: any) => void) {
        var getUrl = config.douBao.videoGenerate.url + "/" + id;
        var request = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.douBao.apiKey}`,
            },
        };
        var taskThread = setInterval(async () => {
            let response = await fetch(getUrl, request);
            let responseJson = await response.json();
            if (responseJson.status == "succeeded") {
                clearInterval(taskThread);
                // 处理完成
                if (successHandler) successHandler(e, responseJson);
            } else if (responseJson.status == "failed") {
                clearInterval(taskThread);
                // 处理失败
                if (failHandler) failHandler(e, responseJson);
            } else if (responseJson.status == "cancelled") {
                // 处理取消
                clearInterval(taskThread);
            }
        }, 5000);
    }

    handleFailed(e: any, responseJson: { error: any; }) {
        // 处理失败
        var error = responseJson.error;
        var message = error.message;
        var code = error.code;
        var errorMsg = `[douBao]视频生成失败，错误码：${code}，错误信息：${message}`;
        e.reply(errorMsg);
    }

    handleCompleted(e: any, responseJson: { model: string; content: { video_url: any; }; id: any; }) {
        // 视频生成
        var videoUrl = responseJson.content.video_url;
        var timestamp = new Date().getTime();
        var filePath = path.join(
            PLUGIN_DATA_DIR,
            `${e.group_id}`,
            "video",
            `${timestamp}-${responseJson.id}.mp4`
        );
        downloadFile(videoUrl, filePath)
            .then(() => {
                return e.reply([segment.video(filePath)]);
            })
            .then(() => {
                // 删除文件
                fs.unlink(filePath, (err) => {
                    if (err) {
                        logger.error("[douBao]删除文件出错", err);
                    }
                    return;
                });
            })
            .catch((err) => {
                logger.error("[douBao]下载文件出错", err);
            });
    }
    // ---------------------------------------------------- 歌词生成 ----------------------------------------------------

    /*
    static queryLyricsGenre(): string[] {
        return [
            "Folk", "Pop", "Rock", "Chinese Style", "Hip Hop/Rap", "R&B/Soul", "Punk", "Electronic", "Jazz", "Reggae", "DJ"
        ]
    }

    static queryLyricsMood(): string[] {
        return [
            'Happy', 'Dynamic/Energetic', 'Sentimental/Melancholic/Lonely', 'Inspirational/Hopeful', 'Nostalgic/Memory', 'Excited', 'Sorrow/Sad', 'Chill', 'Romantic'
        ]
    }

    async lyricsGenerate(e: any) {
        if (!config.douBao.useDouBao) return false;
        if (!config.douBao.useLyricsGenerate) return false;
        if (!await this.preCheck(e)) return true;
        var result = await processMessage(e);
        var body: RequestBody = {};
        body.ModelVersion = config.douBao.lyricsGenerate.modelVersion;
        // 将指令部分去除
        result.texts = result.texts.replace(/^#歌词生成豆包/, "").trim();
        result.texts = result.texts.replace(/^#歌词生成/, "").trim();
        if (Objects.isNull(result.texts)) {
            await e.reply("请完善指令内容");
            return true;
        }
        if (result.texts.startsWith("曲风查询")) {
            await e.reply("可用曲风列表：" + douBao.queryLyricsGenre().join(", "));
            return true;
        }
        if (result.texts.startsWith("歌词风格查询")) {
            await e.reply("可用歌词风格列表：" + douBao.queryLyricsMood().join(", "));
            return true;
        }
        // helpMsg += `#歌词生成[豆包] 提示词 [-g曲风] [-m歌词风格] [-sFemale|Male]`;
        var strList = result.texts.split(/\s+/);
        for (var i = 0; i < strList.length; i++) {
            if (strList[i].startsWith("-g")) {
                let genre = strList[i].replace("-g", "");
                body.Genre = genre;
            } else if (strList[i].startsWith("-m")) {
                let mood = strList[i].replace("-m", "");
                body.Mood = mood;
            } else if (strList[i].startsWith("-s")) {
                let gender = strList[i].replace("-s", "");
                body.Gender = gender;
            } else {
                body.Prompt = strList[i];
            }
        }
        if (!body.hasOwnProperty("Prompt")) {
            await e.reply("请添加提示词");
            return true;
        }
        await e.reply("正在生成歌词，请稍等...");
        var response = await this.fetchLyricsGenerate(body, { timeout: 0 });
        if (response?.ResponseMetadata?.Error) {
            await e.reply(`生成歌词失败: ${response?.ResponseMetadata?.Error?.Code}. ${response?.ResponseMetadata?.Error?.Message}`);
            return true;
        }
        if (response.status === this.SuccessCode) {
            var segments = [];
            if (!Objects.isNull(response.data.binary_data_base64)) {
                response.data.binary_data_base64.forEach((base64: string) => {
                    if (!base64.startsWith("data:image/"))
                        segments.push(segment.image(Base64.getBase64ImageType(base64) + base64));
                    else segments.push(segment.image(base64));
                });
            }
            if (!Objects.isNull(response.data.image_urls))
                segments.push(response.data.image_urls.join("\n"));
            await e.reply(segments);
        } else {
            await e.reply(`生成歌词失败:${response.message}`);
        }
    }
    */


    // ---------------------------------------------------- 歌曲生成 ----------------------------------------------------
    static querySongGenre() {
        return [
            "Folk", "Pop", "Rock", "Chinese Style", "Hip Hop/Rap", "R&B/Soul", "Punk", "Electronic", "Jazz", "Reggae", "DJ", "Pop Punk", "Disco",
            "Future Bass", "Pop Rap", "Trap Rap", "R&B Rap", "Chinoiserie Electronic", "GuFeng Music", "Pop Rock", "Jazz Pop", "Bossa Nova", "Contemporary R&B"
        ]
    }

    static querySongMood() {
        return [
            'Happy', 'Dynamic/Energetic', 'Sentimental/Melancholic/Lonely', 'Inspirational/Hopeful', 'Nostalgic/Memory', 'Excited', 'Sorrow/Sad', 'Chill', 'Romantic', 'Miss', 'Groovy/Funky', 'Dreamy/Ethereal', 'Calm/Relaxing'
        ]
    }

    static querySongTimbre() {
        return [
            "Warm", "Bright", "Husky", "Electrified voice", "Sweet_AUDIO_TIMBRE", "Cute_AUDIO_TIMBRE", "Loud and sonorous", "Powerful", "Sexy/Lazy"
        ]
    }
    async songGenerate(e: any) {
        if (!config.douBao.useDouBao) return false;
        if (!config.douBao.useSongGenerate) return false;
        if (!await this.preCheck(e)) return true;
        var result = await processMessage(e);
        var body: RequestBody = {};
        body.SkipCopyCheck = config.douBao.songGenerate.skipCopyCheck;
        // 将指令部分去除
        result.texts = result.texts.replace(/^#歌曲生成豆包/, "").trim();
        result.texts = result.texts.replace(/^#歌曲生成/, "").trim();
        if (Objects.isNull(result.texts)) {
            await e.reply("请完善指令内容");
            return true;
        }
        if (result.texts.startsWith("曲风查询")) {
            await e.reply("可用曲风列表：" + douBao.querySongGenre().join(", "));
            return true;
        }
        if (result.texts.startsWith("歌曲风格查询")) {
            await e.reply("可用歌曲风格列表：" + douBao.querySongMood().join(", "));
            return true;
        }
        if (result.texts.startsWith("音色查询")) {
            await e.reply("可用歌曲音色列表：" + douBao.querySongTimbre().join(", "));
            return true;
        }
        // helpMsg += `#歌词生成[豆包] 提示词 [-g曲风] [-m歌词风格] [-sFemale|Male]`;
        var strList = result.texts.split(/\s+/);
        for (var i = 0; i < strList.length; i++) {
            if (strList[i].startsWith("-g")) body.Genre = strList[i].replace("-g", "");
            else if (strList[i].startsWith("-m")) body.Mood = strList[i].replace("-m", "");
            else if (strList[i].startsWith("-s")) body.Gender = strList[i].replace("-s", "");
            else if (strList[i].startsWith("-t")) body.Timbre = strList[i].replace("-t", "");
            else if (strList[i].startsWith("-d")) body.Duration = parseInt(strList[i].replace("-d", ""));
            else if (strList[i].startsWith("-p")) {
                if (body.hasOwnProperty("Prompt")) {
                    await e.reply("提示词项重复");
                    return true;
                }
                body.Prompt = strList[i].replace("-p", "");
            } else if (strList[i].startsWith("-l")) {
                if (body.hasOwnProperty("Lyrics")) {
                    await e.reply("歌词项重复");
                    return true;
                }
                body.Lyrics = strList[i].replace("-l", "");
            }
            if (body.hasOwnProperty("Prompt") && body.hasOwnProperty("Lyrics")) {
                await e.reply("提示词和歌词只能选择一个");
                return true;
            }
        }
        await e.reply("正在生成歌曲，请稍等...");
        var response = await this.fetchSongGenerate(body, { timeout: 0 });
        if (response?.ResponseMetadata?.Error) {
            await e.reply(`生成歌曲失败: ${response?.ResponseMetadata?.Error?.Code}. ${response?.ResponseMetadata?.Error?.Message}`);
            return true;
        }
        var id = response.Result.TaskID;
        if (Objects.isNull(id)) {
            await e.reply(`歌曲生成失败: ${response.error.code}, ${response.error.message}`);
            return true;
        }
        logger.info(`[douBao]歌曲生成任务创建成功，id：${id}`);
        // 创建线程
        this.createSongGenerateTaskThread(e, id, this.handleSongGenerateCompleted, this.handleSongFailed);
        return true;
    }
    createSongGenerateTaskThread(e: any, id: string, successHandler?: (e: any, responseJson: any) => Promise<void>, failHandler?: (e: any, responseJson: any) => Promise<void>) {
        var body = {
            TaskID: id,
        }
        var taskThread = setInterval(async () => {
            let response = await this.fetchSongQuery(body);
            if (response.Result.Status == 2) {
                clearInterval(taskThread);
                // 处理完成
                if (successHandler) await successHandler(e, response);
            } else if (response.Result.Status == 3) {
                clearInterval(taskThread);
                // 处理失败
                if (failHandler) await failHandler(e, response);
            } else if (response.Result.Status != 0 && response.Result.Status != 1) {
                // 处理取消
                clearInterval(taskThread);
            }
        }, 5000);
    }
    async handleSongFailed(e: any, response: { error: any; }) {
        // 处理失败
        var error = response.error;
        var message = error.message;
        var code = error.code;
        var errorMsg = `[douBao]歌曲生成失败，错误码：${code}，错误信息：${message}`;
        e.reply(errorMsg);
    }

    async handleSongGenerateCompleted(e: any, response: any) {
        const audioUrl = response.Result.SongDetail.AudioUrl;
        const captions = response.Result.SongDetail.Captions;
        const { lrc } = AudioParse.parseCaptions(captions);
        const res = await fetch(audioUrl);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const arrayBuffer = await res.arrayBuffer()
        var timestamp = new Date().getTime();
        const filePath = path.join(
            PLUGIN_DATA_DIR,
            `${e.group_id}`,
            "audio",
            `${timestamp}_${response.Result.TaskID}.${(await FileType.getFileTypeFromBuffer(arrayBuffer)).ext}`
        );
        await downloadFile(audioUrl, filePath);
        await e.reply(segment.file(filePath, path.basename(filePath)));
        if (config.douBao.songGenerate.returnLyrics) {
            await e.reply(lrc);
        }
        fs.unlinkSync(filePath);
    }
}
