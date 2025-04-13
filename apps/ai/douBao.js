import Objects, { Base64 } from "#juhkff.kits";
import { downloadFile, url2Base64 } from "#juhkff.net";
import { pluginData } from "#juhkff.path";
import path from "path";
import fs from "fs";
import setting from "#juhkff.setting";
import { getServiceApi } from "../../ai/doubao/api.js";
import { segment } from "oicq";
import fastImageSize from "fast-image-size";

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
          // 匹配以 #视频生成豆包 开头的消息
          reg: "^#视频生成豆包.*",
          fnc: "videoGenerate",
        },
        {
          // 匹配以 #图片生成豆包 开头的消息
          reg: "^#图片生成豆包.*",
          fnc: "imageGenerate",
        },
        {
          // 匹配以 #图片风格化豆包 开头的消息
          reg: "^#图片风格化豆包.*",
          fnc: "imageStyleTransfer",
        },
      ],
    });

    this.fetchImageGenerate = getServiceApi(
      this.Config.imageGenerate.host,
      this.Config.imageGenerate.accessKeyId,
      this.Config.imageGenerate.secretAccessKey,
      "POST",
      this.Config.imageGenerate.action,
      this.Config.imageGenerate.version,
      this.Config.imageGenerate.region,
      this.Config.imageGenerate.service
    );

    // 删除残留的视频文件
    fs.readdirSync(pluginData).forEach((dir) => {
      const dirPath = path.join(pluginData, dir);
      if (fs.statSync(dirPath).isDirectory()) {
        fs.readdirSync(dirPath).forEach((dir2) => {
          const dirPath2 = path.join(dirPath, dir2);
          if (fs.statSync(dirPath2).isDirectory() && dir2 === "video") {
            fs.readdirSync(dirPath2).forEach((file) => {
              fs.unlinkSync(path.join(dirPath2, file));
            });
          }
        });
      }
    });
    // TODO 其实开关关了的话没必要启定时任务，暂时先这么写了
    if (this.Config.useDouBao) {
      this.cleanupInterval = setInterval(async () => {
        try {
          const now = Date.now();
          const thirtyMinutesAgo = now - 30 * 60 * 1000;
          fs.readdirSync(pluginData).forEach((dir) => {
            const dirPath = path.join(pluginData, dir);
            if (fs.statSync(dirPath).isDirectory()) {
              fs.readdirSync(dirPath).forEach((dir2) => {
                const dirPath2 = path.join(dirPath, dir2);
                if (fs.statSync(dirPath2).isDirectory() && dir2 === "video") {
                  fs.readdirSync(dirPath2).forEach((file) => {
                    const filePath = path.join(dirPath2, file);
                    const fileStat = fs.statSync(filePath);
                    if (
                      fileStat.isFile() &&
                      fileStat.birthtimeMs < thirtyMinutesAgo
                    ) {
                      fs.unlinkSync(filePath);
                      console.log(`[douBao]已删除旧文件: ${filePath}`);
                    }
                  });
                }
              });
            }
          });
        } catch (err) {
          console.error("清理任务执行出错:", err);
        }
      }, 30 * 60 * 1000); // 每30分钟执行一次
    }
  }

  get Config() {
    return setting.getConfig("douBao");
  }

  async help(e) {
    if (!this.Config.useDouBao) return false;
    var helpMsg = `可用指令：[]中为可选项，()中为解释说明`;
    if (this.Config.useVideoGenerate)
      helpMsg += `\n  #视频生成豆包 文本描述|图片 [宽高比] [5|10](视频秒数)`;
    if (this.Config.useImageGenerate) {
      helpMsg += `\n  #图片生成豆包 文本描述 [-w 宽] [-h 高]`;
      helpMsg += `\n  #图片生成豆包 文本描述 图片1|图片...(同宽高)`;
    }
    await e.reply(helpMsg);
    return true;
  }

  // --------------------------------------------------- 图片风格化 ---------------------------------------------------
  async imageStyleTransfer(e) { }

  // ---------------------------------------------------- 图片生成 ----------------------------------------------------

  get imageGenerateSuccessCode() {
    return 10000;
  }

  async imageGenerate(e) {
    if (!this.Config.useDouBao) return false;
    if (!this.Config.useImageGenerate) return true;
    if (
      Objects.hasNull(
        this.Config.imageGenerate.accessKeyId,
        this.Config.imageGenerate.secretAccessKey
      )
    ) {
      await e.reply("请先设置accessKeyId和secretAccessKey");
      return true;
    }
    var result = await processMessage(e.message);
    var body = {};
    var width = null,
      height = null;
    // 将指令部分去除
    result.texts = result.texts.replace(/^#图片生成豆包/, "").trim();
    if (Objects.isNull(result.images)) {
      // 纯文本
      var strList = result.texts.split(" ");
      for (var i = 0; i < strList.length - 1; i++) {
        if (strList[i].startsWith("-w")) {
          width = parseInt(strList[i + 1]);
        } else if (strList[i].startsWith("-h")) {
          height = parseInt(strList[i + 1]);
        }
      }
      body.req_key = this.Config.imageGenerate.reqKey;
      body.prompt = result.texts;
      if (!Objects.isNull(this.Config.imageGenerate.modelVersion))
        body.model_version = this.Config.imageGenerate.modelVersion;
      if (!Objects.isNull(this.Config.imageGenerate.reqScheduleConf))
        body.req_schedule_conf = this.Config.imageGenerate.reqScheduleConf;
      if (!Objects.isNull(width)) body.width = width;
      if (!Objects.isNull(height)) body.height = height;
      if (!Objects.isNull(this.Config.imageGenerate.usePreLlm))
        body.use_pre_llm = this.Config.imageGenerate.usePreLlm;
      if (!Objects.isNull(this.Config.imageGenerate.useSr))
        body.use_sr = this.Config.imageGenerate.useSr;
      if (!Objects.isNull(this.Config.imageGenerate.returnUrl))
        body.return_url = this.Config.imageGenerate.returnUrl;
    } else {
      // 图生图
      var width = undefined,
        height = undefined;
      // 判断图片尺寸是否一致，目前豆包多图生图只支持同宽高
      for (var i = 0; i < result.images.length; i++) {
        var url = result.images[i];
        // TODO 最好能不下载到本地
        var timestamp = new Date().getTime();
        var filePath = path.join(
          pluginData,
          `${e.group_id}`,
          "video",
          `${timestamp}_${url.replace(/[^a-zA-Z0-9]/g, "_")}`
        );
        await downloadFile(url, filePath);
        var dimensions = fastImageSize(filePath);
        // 删除文件
        fs.unlinkSync(filePath);
        if (width == undefined) width = dimensions.width;
        if (height == undefined) height = dimensions.height;
        if (width != dimensions.width || height != dimensions.height) {
          e.reply("图片尺寸不一致，请重新发送");
          return true;
        }
      }
      body.req_key = this.Config.imageGenerate.withImgReqKey;
      if (!Objects.isNull(this.Config.imageGenerate.withImgModelVersion))
        body.model_version = this.Config.imageGenerate.withImgModelVersion;
      body.image_urls = result.images;
      body.prompt = result.texts;
      if (!Objects.isNull(this.Config.imageGenerate.withImgUseRephraser))
        body.use_rephraser = this.Config.imageGenerate.withImgUseRephraser;
      if (!Objects.isNull(this.Config.imageGenerate.withImgReturnUrl))
        body.return_url = this.Config.imageGenerate.withImgReturnUrl;
      body.controlnet_args = [];
      for (var i = 0; i < result.images.length; i++) {
        body.controlnet_args.push({
          type: this.Config.imageGenerate.withImgControlnetArgs.type,
          strength: this.Config.imageGenerate.withImgControlnetArgs.strength,
          binary_data_index: i,
        });
      }
    }
    await e.reply("正在生成图片，请稍等...");
    var response = await this.fetchImageGenerate(body, { timeout: 0 });
    if (response.status === this.imageGenerateSuccessCode) {
      var segments = [];
      if (!Objects.isNull(response.data.binary_data_base64)) {
        // 其实只会返回一张图，但就这样吧，挺好的
        response.data.binary_data_base64.forEach((base64) => {
          if (!base64.startsWith("data:image/"))
            segments.push(
              segment.image(Base64.getBase64ImageType(base64) + base64)
            );
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

  // ---------------------------------------------------- 视频生成 ----------------------------------------------------

  get VideoGenerateApiKey() {
    return Objects.isNull(this.Config.videoGenerate.apiKey)
      ? ""
      : this.Config.videoGenerate.apiKey;
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
    return Objects.isNull(this.Config.videoGenerate.url)
      ? ""
      : this.Config.videoGenerate.url;
  }

  get VideoGenerateModel() {
    return Objects.isNull(this.Config.videoGenerate.model)
      ? ""
      : this.Config.videoGenerate.model;
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
    if (!this.Config.useDouBao) return false;
    if (!this.Config.useVideoGenerate) return true;
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
    var msgList = processMessage(e.message);
    var texts = msgList.texts;
    texts = texts.replace("#视频生成豆包", "").trim();
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
      } else if (content.type == "image") {
        body.content.push({
          type: "image_url",
          image_url: {
            url: await url2Base64(content.url),
          },
        });
      } else {
        // 其它类型，保持原样加进body，虽然不知道有什么用，反正应该走不到这
        body.content.push(content);
      }
    }
    request.body = body;
    request.body = JSON.stringify(request.body);
    var response = await fetch(this.VideoGenerateUrl, request);
    response = await response.json();
    var id = response.id;
    if (Objects.isNull(id)) {
      await e.reply("视频生成失败，请稍后再试");
      return true;
    }
    logger.mark(`[douBao]视频生成任务创建成功，id：${id}`);
    // 创建线程
    this.createTaskThread(e, id);
    await e.reply("视频生成中，请稍等...");
    return true;
  }

  createTaskThread(e, id) {
    var getUrl = this.VideoGenerateUrl + "/" + id;
    var request = JSON.parse(JSON.stringify(this.VideoGenerateRequestGet));
    var taskThread = setInterval(async () => {
      var response = await fetch(getUrl, request);
      response = await response.json();
      if (response.status == "succeeded") {
        clearInterval(taskThread);
        // 处理完成
        this.handleCompleted(e, response);
      } else if (response.status == "failed") {
        clearInterval(taskThread);
        // 处理失败
        this.handleFailed(e, response);
      } else if (response.status == "cancelled") {
        // 处理取消
        clearInterval(taskThread);
      }
    }, 5000);
  }

  handleFailed(e, response) {
    // 处理失败
    var error = response.error;
    var message = error.message;
    var code = error.code;
    var errorMsg = `[douBao]视频生成失败，错误码：${code}，错误信息：${message}`;
    e.reply(errorMsg);
  }

  handleCompleted(e, response) {
    if (response.model == this.VideoGenerateModel) {
      // 视频生成
      var videoUrl = response.content.video_url;
      var timestamp = new Date().getTime();
      var filePath = path.join(
        pluginData,
        `${e.group_id}`,
        "video",
        `${timestamp}-${response.id}.mp4`
      );
      downloadFile(videoUrl, filePath)
        .then(() => {
          return e.reply([segment.video(filePath)]);
        })
        .then(() => {
          // 删除文件
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`[douBao]删除视频失败: ${err}`);
            }
            return;
          });
        })
        .catch((err) => {
          console.error(`[douBao]${err}`);
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
async function processMessage(msgList) {
  var result = {
    texts: "",
    images: [],
    content: [],
  };
  var texts = [];
  for (var i = 0; i < msgList.length; i++) {
    var msg = msgList[i];
    if (msg.type == "text") {
      result.content.push({
        type: "text",
        text: msg.text.replace(/\s+/g, " ").trim(),
      });
      texts.push(msg.text);
    } else if (msg.type == "image") {
      result.content.push({ type: "image", url: msg.url });
      result.images.push(msg.url);
    } else {
      //其它类型，保持原样加进result，虽然不知道有什么用
      result.content.push(msg);
    }
  }
  var textPart = texts.join(" ");
  // 将空格固定为一个
  textPart = textPart.replace(/\s+/g, " ");
  result.texts = textPart;
  return result;
}
