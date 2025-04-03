import Objects from "#juhkff.kits";
import { downloadFile, url2Base64 } from "#juhkff.net";
import { pluginData } from "#juhkff.path";
import path from "path";
import fs from "fs";
import setting from "#juhkff.setting";

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
      ],
    });
    // TODO apiKey 设置
    this.apiKey = "";
    // 视频生成设置
    this.videoGenerateUrl =
      "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks";
    this.videoGenerateBody = {
      model: "doubao-seaweed-241128",
      content: [],
    };
    // 请求体，使用时从此复制
    this.postRequest = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer ",
      },
      body: {},
    };
    this.getRequest = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer ",
      },
    };
  }

  get Config() {
    return setting.getConfig("douBao");
  }

  async help(e) {
    var helpMsg =
      `可用指令：[]中为可选项\n` +
      `  #视频生成豆包 文本描述 [宽高比] [5|10](视频秒数)\n` +
      `  #视频生成豆包 图片`;
    await e.reply(helpMsg);
  }

  async videoGenerate(e) {
    if (Objects.isNull(this.Config.apiKey)) {
      await e.reply("请先设置apiKey");
      return true;
    }
    var msgList = processMessage(e.message);
    var texts = msgList.texts;
    texts = texts.replace("#视频生成豆包", "").trim();
    if (Objects.isNull(texts) && Objects.isNull(msgList.images)) {
      await e.reply("请添加描述文本或图片");
      return true;
    }
    var request = JSON.parse(JSON.stringify(this.postRequest));
    request.headers.Authorization += this.Config.apiKey;
    var body = JSON.parse(JSON.stringify(this.videoGenerateBody));
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
    var response = await fetch(this.videoGenerateUrl, request);
    response = await response.json();
    var id = response.id;
    if (Objects.isNull(id)) {
      await e.reply("视频生成失败，请稍后再试");
      return true;
    }
    // 创建线程
    this.createTaskThread(e, id);
    await e.reply("视频生成中，请稍等...");
    return true;
  }

  createTaskThread(e, id) {
    var getUrl = this.videoGenerateUrl + "/" + id;
    var request = JSON.parse(JSON.stringify(this.getRequest));
    request.headers.Authorization += this.Config.apiKey;
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
    var errorMsg = `视频生成失败，错误码：${code}，错误信息：${message}`;
    e.reply(errorMsg);
  }

  handleCompleted(e, response) {
    if (response.model == "doubao-seaweed-241128") {
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
              console.error(`删除豆包生成的视频失败: ${err}`);
            }
            return;
          });
        })
        .catch((err) => {
          console.error(err);
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
function processMessage(msgList) {
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
