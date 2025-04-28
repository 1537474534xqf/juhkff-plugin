import path from "path";
import fs from "fs";
import { getServiceApi } from "../../ai/doubao/api.js";
import { segment } from "oicq";
// @ts-ignore
import fastImageSize from "fast-image-size";
import { PLUGIN_DATA_DIR } from "../../model/path.js";
import { Base64, Objects } from "../../utils/kits.js";
import { downloadFile, url2Base64 } from "../../utils/net.js";
import { douBaoConfig } from "../../config/define/ai/douBao.js";
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
                    // 匹配以 #图片生成 开头的消息
                    reg: "^#图片生成.*",
                    fnc: "imageGenerate",
                },
                {
                    // 匹配以 #图片风格化 开头的消息
                    reg: "^#图片风格化.*",
                    fnc: "imageStyle",
                },
                {
                    reg: "^#图片模仿.*",
                    fnc: "imageImitate",
                }
            ],
        });
        // ---------------------------------------------------- ServiceApi ----------------------------------------------------
        if (douBaoConfig.useDouBao) {
            this.fetchImageService = getServiceApi(douBaoConfig.imageService.host, douBaoConfig.imageService.accessKeyId, douBaoConfig.imageService.secretAccessKey, "POST", douBaoConfig.imageService.action, douBaoConfig.imageService.version, douBaoConfig.imageService.region, douBaoConfig.imageService.service);
        }
        // --------------------------------------------------------------------------------------------------------------------
    }
    async help(e) {
        if (!douBaoConfig.useDouBao)
            return false;
        var helpMsg = `可用指令：[]中为可选项，()中为解释说明`;
        if (douBaoConfig.useVideoGenerate)
            helpMsg += `\n  #视频生成 文本|图片 [宽高比] [5|10](视频秒数)`;
        if (douBaoConfig.useImageGenerate) {
            helpMsg += `\n  #图片生成 文本 图片1|图片...(同宽高) [-w 宽] [-h 高]`;
        }
        if (douBaoConfig.useImageImitate) {
            helpMsg += `\n  #图片模仿 文本 图片`;
        }
        if (douBaoConfig.useImageStyle) {
            helpMsg += `\n  #图片风格化 类型前缀 图片`;
            helpMsg += `\n  #图片风格化 类型列表`;
        }
        await e.reply(helpMsg);
        return true;
    }
    // ------------------------------------------------ 图片服务通用检查 -------------------------------------------------
    async preCheck(e) {
        if (Objects.hasNull(douBaoConfig.imageService.accessKeyId, douBaoConfig.imageService.secretAccessKey)) {
            await e.reply("请先设置accessKeyId和secretAccessKey");
            return false;
        }
    }
    get SuccessCode() {
        return 10000;
    }
    // --------------------------------------------------- 图片风格化 ---------------------------------------------------
    get imageStyleReqKeyMap() {
        var reqKeyList = douBaoConfig.imageStyle.reqKeyMap;
        var reqKeyMap = {};
        reqKeyList.forEach((item) => {
            reqKeyMap[item.key] = item.value;
        });
        return reqKeyMap;
    }
    get iamgeStyleSubReqKeyMap() {
        var subReqKeyList = douBaoConfig.imageStyle.subReqKeyMap;
        var subReqKeyMap = {};
        subReqKeyList.forEach((item) => {
            subReqKeyMap[item.key] = item.value;
        });
        return subReqKeyMap;
    }
    async imageStyle(e) {
        if (!douBaoConfig.useDouBao)
            return false;
        if (!douBaoConfig.useImageStyle)
            return true;
        if (!this.preCheck(e))
            return true;
        let result = await processMessage(e);
        var body = {};
        // 将指令部分去除并切分
        let strList = result.texts.replace(/^#图片风格化/, "").trim().split(" ");
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
        body.return_url = douBaoConfig.imageStyle.returnUrl;
        await e.reply("正在生成图片，请稍等...");
        var response = await this.fetchImageService(body, { timeout: 0 });
        if (response?.ResponseMetadata?.Error) {
            await e.reply(`生成图片失败: ${response?.ResponseMetadata?.Error?.Code}. ${response?.ResponseMetadata?.Error?.Message}`);
            return true;
        }
        if (response.status === this.SuccessCode) {
            var segments = [];
            if (!Objects.isNull(response.data.binary_data_base64)) {
                response.data.binary_data_base64.forEach((base64) => {
                    if (!base64.startsWith("data:image/"))
                        segments.push(segment.image(Base64.getBase64ImageType(base64) + base64));
                    else
                        segments.push(segment.image(base64));
                });
            }
            if (!Objects.isNull(response.data.image_urls))
                segments.push(response.data.image_urls.join("\n"));
            await e.reply(segments);
        }
        else {
            await e.reply(`生成图片失败:${response.message}`);
        }
        return true;
    }
    // ---------------------------------------------------- 图片模仿 ----------------------------------------------------
    async imageImitate(e) {
        if (!douBaoConfig.useDouBao)
            return false;
        if (!douBaoConfig.useImageImitate)
            return true;
        if (!this.preCheck(e))
            return true;
        var result = await processMessage(e);
        var body = {};
        // 将指令部分去除
        result.texts = result.texts.replace(/^#图片模仿/, "").trim();
        var strList = result.texts.split(" ");
        var width = null, height = null;
        for (var i = 0; i < strList.length - 1; i++) {
            if (strList[i].startsWith("-w")) {
                width = parseInt(strList[i + 1]);
            }
            else if (strList[i].startsWith("-h")) {
                height = parseInt(strList[i + 1]);
            }
        }
        if (!Objects.isNull(width))
            body.width = width;
        if (!Objects.isNull(height))
            body.height = height;
        if (Objects.isNull(result.images)) {
            // 纯文本
            await e.reply("请发送图片");
            return true;
        }
        body.req_key = douBaoConfig.imageImitate.reqKey;
        body.image_urls = result.images;
        body.prompt = result.texts;
        if (!Objects.isNull(douBaoConfig.imageImitate.returnUrl))
            body.return_url = douBaoConfig.imageImitate.returnUrl;
        if (!Objects.isNull(douBaoConfig.imageImitate.useSr))
            body.use_sr = douBaoConfig.imageImitate.useSr;
        await e.reply("正在生成图片，请稍等...");
        var response = await this.fetchImageService(body, { timeout: 0 });
        if (response?.ResponseMetadata?.Error) {
            await e.reply(`生成图片失败: ${response?.ResponseMetadata?.Error?.Code}. ${response?.ResponseMetadata?.Error?.Message}`);
            return true;
        }
        if (response.status === this.SuccessCode) {
            var segments = [];
            if (!Objects.isNull(response.data.binary_data_base64)) {
                response.data.binary_data_base64.forEach((base64) => {
                    if (!base64.startsWith("data:image/"))
                        segments.push(segment.image(Base64.getBase64ImageType(base64) + base64));
                    else
                        segments.push(segment.image(base64));
                });
            }
            if (!Objects.isNull(response.data.image_urls))
                segments.push(response.data.image_urls.join("\n"));
            await e.reply(segments);
        }
        else {
            await e.reply(`生成图片失败:${response.message}`);
        }
    }
    // ---------------------------------------------------- 图片生成 ----------------------------------------------------
    async imageGenerate(e) {
        if (!douBaoConfig.useDouBao)
            return false;
        if (!douBaoConfig.useImageGenerate)
            return true;
        if (!this.preCheck(e))
            return true;
        var result = await processMessage(e);
        var body = {};
        var width = null, height = null;
        // 将指令部分去除
        result.texts = result.texts.replace(/^#图片生成/, "").trim();
        var strList = result.texts.split(" ");
        for (var i = 0; i < strList.length - 1; i++) {
            if (strList[i].startsWith("-w")) {
                width = parseInt(strList[i + 1]);
            }
            else if (strList[i].startsWith("-h")) {
                height = parseInt(strList[i + 1]);
            }
        }
        if (!Objects.isNull(width))
            body.width = width;
        if (!Objects.isNull(height))
            body.height = height;
        if (Objects.isNull(result.images)) {
            // 纯文本
            body.req_key = douBaoConfig.imageGenerate.reqKey;
            body.prompt = result.texts;
            if (!Objects.isNull(douBaoConfig.imageGenerate.modelVersion))
                body.model_version = douBaoConfig.imageGenerate.modelVersion;
            if (!Objects.isNull(douBaoConfig.imageGenerate.reqScheduleConf))
                body.req_schedule_conf = douBaoConfig.imageGenerate.reqScheduleConf;
            if (!Objects.isNull(douBaoConfig.imageGenerate.usePreLlm))
                body.use_pre_llm = douBaoConfig.imageGenerate.usePreLlm;
            if (!Objects.isNull(douBaoConfig.imageGenerate.useSr))
                body.use_sr = douBaoConfig.imageGenerate.useSr;
            if (!Objects.isNull(douBaoConfig.imageGenerate.returnUrl))
                body.return_url = douBaoConfig.imageGenerate.returnUrl;
        }
        else {
            // 图生图
            width = undefined, height = undefined;
            // 判断图片尺寸是否一致，目前豆包多图生图只支持同宽高
            for (var i = 0; i < result.images.length; i++) {
                var url = result.images[i];
                // TODO 最好能不下载到本地
                var timestamp = new Date().getTime();
                var filePath = path.join(PLUGIN_DATA_DIR, `${e.group_id}`, "video", `${timestamp}_${url.replace(/[^a-zA-Z0-9]/g, "_")}`);
                await downloadFile(url, filePath);
                var dimensions = fastImageSize(filePath);
                // 删除文件
                fs.unlinkSync(filePath);
                if (width == undefined)
                    width = dimensions.width;
                if (height == undefined)
                    height = dimensions.height;
                if (width != dimensions.width || height != dimensions.height) {
                    e.reply("图片尺寸不一致，请重新发送");
                    return true;
                }
            }
            body.req_key = douBaoConfig.imageGenerate.withImgReqKey;
            if (!Objects.isNull(douBaoConfig.imageGenerate.withImgModelVersion))
                body.model_version = douBaoConfig.imageGenerate.withImgModelVersion;
            body.image_urls = result.images;
            body.prompt = result.texts;
            if (!Objects.isNull(douBaoConfig.imageGenerate.withImgUseRephraser))
                body.use_rephraser = douBaoConfig.imageGenerate.withImgUseRephraser;
            if (!Objects.isNull(douBaoConfig.imageGenerate.withImgReturnUrl))
                body.return_url = douBaoConfig.imageGenerate.withImgReturnUrl;
            body.controlnet_args = [];
            for (var i = 0; i < result.images.length; i++) {
                body.controlnet_args.push({
                    type: douBaoConfig.imageGenerate.withImgControlnetArgs.type,
                    strength: douBaoConfig.imageGenerate.withImgControlnetArgs.strength,
                    binary_data_index: i,
                });
            }
        }
        var response = await this.fetchImageService(body, { timeout: 0 });
        if (response.status === this.SuccessCode) {
            await e.reply("正在生成图片，请稍等...");
            var segments = [];
            if (!Objects.isNull(response.data.binary_data_base64)) {
                // 其实只会返回一张图，但就这样吧，挺好的
                response.data.binary_data_base64.forEach((base64) => {
                    if (!base64.startsWith("data:image/"))
                        segments.push(segment.image(Base64.getBase64ImageType(base64) + base64));
                    else
                        segments.push(segment.image(base64));
                });
            }
            if (!Objects.isNull(response.data.image_urls))
                segments.push(response.data.image_urls.join("\n"));
            await e.reply(segments);
        }
        else {
            await e.reply(`生成图片失败:${response.message}`);
        }
    }
    // ---------------------------------------------------- 视频生成 ----------------------------------------------------
    get VideoGenerateApiKey() {
        return Objects.isNull(douBaoConfig.videoGenerate.apiKey)
            ? ""
            : douBaoConfig.videoGenerate.apiKey;
    }
    get VideoGenerateRequestPost() {
        return {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.ApiKey}`,
            },
            body: {},
        };
    }
    get VideoGenerateRequestGet() {
        return {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.ApiKey}`,
            },
        };
    }
    get VideoGenerateUrl() {
        return Objects.isNull(douBaoConfig.videoGenerate.url)
            ? ""
            : douBaoConfig.videoGenerate.url;
    }
    get VideoGenerateModel() {
        return Objects.isNull(douBaoConfig.videoGenerate.model)
            ? ""
            : douBaoConfig.videoGenerate.model;
    }
    get VideoGenerateBody() {
        return {
            model: Objects.isNull(this.VideoGenerateModel)
                ? ""
                : this.VideoGenerateModel,
            content: [],
        };
    }
    async videoGenerate(e) {
        if (!douBaoConfig.useDouBao)
            return false;
        if (!douBaoConfig.useVideoGenerate)
            return true;
        if (Objects.isNull(this.VideoGenerateApiKey)) {
            await e.reply("请先设置apiKey");
            return true;
        }
        if (Objects.isNull(this.VideoGenerateUrl)) {
            await e.reply("请先设置请求地址");
            return true;
        }
        if (Objects.isNull(this.VideoGenerateModel)) {
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
        var request = JSON.parse(JSON.stringify(this.VideoGenerateRequestPost));
        var body = JSON.parse(JSON.stringify(this.VideoGenerateBody));
        for (var i = 0; i < msgList.content.length; i++) {
            var content = msgList.content[i];
            if (content.type == "text") {
                body.content.push({
                    type: "text",
                    text: content.text,
                });
            }
            else if (content.type == "image") {
                body.content.push({
                    type: "image_url",
                    image_url: {
                        url: await url2Base64(content.url),
                    },
                });
            }
            else {
                // 其它类型，保持原样加进body，虽然不知道有什么用，反正应该走不到这
                body.content.push(content);
            }
        }
        request.body = body;
        request.body = JSON.stringify(request.body);
        let response = await fetch(this.VideoGenerateUrl, request);
        let responseJson = await response.json();
        var id = responseJson.id;
        if (Objects.isNull(id)) {
            await e.reply("视频生成失败，请稍后再试");
            return true;
        }
        logger.mark(`[douBao]视频生成任务创建成功，id：${id}`);
        // 创建线程
        this.createTaskThread(e, id, this.handleCompleted, this.handleFailed);
        await e.reply("视频生成中，请稍等...");
        return true;
    }
    createTaskThread(e, id, successHandler, failHandler) {
        var getUrl = this.VideoGenerateUrl + "/" + id;
        var request = JSON.parse(JSON.stringify(this.VideoGenerateRequestGet));
        var taskThread = setInterval(async () => {
            let response = await fetch(getUrl, request);
            let responseJson = await response.json();
            if (responseJson.status == "succeeded") {
                clearInterval(taskThread);
                // 处理完成
                if (successHandler)
                    successHandler(e, responseJson);
            }
            else if (responseJson.status == "failed") {
                clearInterval(taskThread);
                // 处理失败
                if (failHandler)
                    failHandler(e, responseJson);
            }
            else if (responseJson.status == "cancelled") {
                // 处理取消
                clearInterval(taskThread);
            }
        }, 5000);
    }
    handleFailed(e, responseJson) {
        // 处理失败
        var error = responseJson.error;
        var message = error.message;
        var code = error.code;
        var errorMsg = `[douBao]视频生成失败，错误码：${code}，错误信息：${message}`;
        e.reply(errorMsg);
    }
    handleCompleted(e, responseJson) {
        if (responseJson.model == this.VideoGenerateModel) {
            // 视频生成
            var videoUrl = responseJson.content.video_url;
            var timestamp = new Date().getTime();
            var filePath = path.join(PLUGIN_DATA_DIR, `${e.group_id}`, "video", `${timestamp}-${responseJson.id}.mp4`);
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
    }
}
/**
 * 处理消息
 * @param {*} msgList
 * @returns result {texts: "", images: [], content: []}
 * texts: 文本部分
 * images: 图片部分
 * content: 按顺序排列的消息体
 */
async function processMessage(e) {
    var result = { texts: "", images: [], content: [] };
    var msgList = e.message;
    var texts = [];
    for (var i = 0; i < msgList.length; i++) {
        var msg = msgList[i];
        if (msg.type == "text") {
            result.content.push({
                type: "text",
                text: msg.text.replace(/\s+/g, " ").trim(),
            });
            texts.push(msg.text);
        }
        else if (msg.type == "image") {
            result.content.push({ type: "image", url: msg.url });
            result.images.push(msg.url);
        }
        else if (msg.type == "reply") {
            var sourceImages = await e.getReply(msg.id);
            sourceImages = sourceImages?.message.filter((each) => {
                return each.type == "image";
            });
            sourceImages.forEach((each) => {
                result.content.push({ type: "image", url: each.url });
                result.images.push(each.url);
            });
        }
        else if (msg.type != "at") {
            //其它类型，保持原样加进result，虽然不知道有什么用
            result.content.push(msg);
        }
    }
    var textPart = texts.join(" ");
    // 将空格固定为一个
    textPart = textPart.replace(/\s+/g, " ");
    result.texts = textPart.trim();
    return result;
}
//# sourceMappingURL=douBao.js.map