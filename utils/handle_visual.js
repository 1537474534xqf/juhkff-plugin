/**
 * @file handle.js
 * @description: 原始消息处理相关
 */

import { ChatInterface, chatMap } from "#juhkff.api.chat";
import { formatDateDetail } from "#juhkff.date";
import { extractUrlContent, analyseImage } from "#juhkff.helper";
import { url2Base64 } from "#juhkff.net";
import { get_source_message } from "#juhkff.redis";
import setting from "#juhkff.setting";
import _ from "lodash";

function getConfig() {
  return setting.getConfig("autoReply");
}

/**
 * 视觉模型版handle：由于会生成插件专属消息处理列表j_msg，该方法必须作为消息处理的第一个函数
 * @param {} e
 */
export async function parseImage_Visual(e) {
  if (!e.j_msg) e.j_msg = {
    sourceImg: [],
    sourceText: "",
    img: [],
    text: "",
    notProcessed: e.message
  };

  for (let i = 0; i < e.j_msg.notProcessed.length; i++) {
    if (e.j_msg.notProcessed[i].type == "image") {
      // 使用视觉AI处理群聊回复的话就直接把img2base64存起来
      var url = e.j_msg.notProcessed[i].url;
      var base64 = await url2Base64(url);
      e.j_msg.img.push(base64);
      e.j_msg.notProcessed.splice(i, 1);
      i--;
    }
  }
}

/**
 * 视觉模型版handle：确保该方法在parseImage之后执行
 * @param {*} e
 * @returns
 */
export async function parseSourceMessage_Visual(e) {
  if (!e.j_msg) return;
  for (let i = 0; i < e.j_msg.notProcessed.length; i++) {
    if (e.j_msg.notProcessed[i].type === "reply") {
      // 优先从redis中获取引用消息
      var redis_source = await get_source_message(e.group_id, e.j_msg.notProcessed[i].id);
      if (redis_source != undefined) {
        //TODO 修改redis内容格式
        var msg = `[回复 ${redis_source}]`;
        e.j_msg.notProcessed[i] = { text: msg, type: "reply" };

        e.j_msg.notProcessed.splice(i, 1);
        i--;
        continue;
      }

      var reply = await e.getReply(e.j_msg.notProcessed[i].id);
      if (reply) {
        let senderTime = undefined; // 存储发送者时间
        let senderNickname = ""; // 存储发送者昵称
        var msg = []; // 收集文本消息

        // 获取发送者昵称和时间
        senderTime = await formatDateDetail(reply.time * 1000);
        senderNickname = reply.sender?.card || reply.sender?.nickname;
        for (var val of reply.message) {
          if (val.type == "image") {
            // 使用视觉AI处理群聊回复的话就直接把img2base64存起来
            var url = val.url;
            var base64 = await url2Base64(url);
            e.j_msg.sourceImg.push(base64);
          } else if (val.type == "text") {
            msg.push(val.text);
          } else if (val.type == "file") {
            // 不支持消息中的文件
            continue;
          } else if (val.type == "json") {
            var result = analyseJsonMessage(val.data);
            if (result) {
              msg.push(result);
            }
          }
        }
        var quotedLines;
        if (msg.length <= 0) {
          quotedLines = "不支持显示的消息内容";
        } else {
          quotedLines = msg.map((line) => `${line}`).join(" ");
        }
        e.j_msg.sourceText = `[回复 ${senderTime} - ${senderNickname}：${quotedLines}]`;
      }
      e.j_msg.notProcessed.splice(i, 1);
      i--;
    }
  }
  return e;
}

/**
 * 确保该方法在parseImage之后执行
 * @param {} e
 * @returns
 */
export async function parseJson_Visual(e) {
  if (!e.j_msg) return;
  for (let i = 0; i < e.j_msg.notProcessed.length; i++) {
    if (e.j_msg.notProcessed[i].type === "json") {
      var result = analyseJsonMessage(e.j_msg.notProcessed[i].data);
      if (result) {
        e.j_msg.notProcessed[i] = { text: result, type: "json2text" };
      }
    }
  }
}

function analyseJsonMessage(message) {
  try {
    let data = JSON.parse(message);
    if (data.meta?.detail_1?.title === "哔哩哔哩") {
      return `<分享链接，链接内容的分析结果——${data.prompt}>`;
    } else if (data.meta?.news?.tag === "小黑盒") {
      return `<分享链接，链接内容的分析结果——标题：${data.meta?.news?.title}，内容：${data.meta?.news?.desc}>`;
    }
    return undefined;
  } catch (error) {
    logger.error(`[analyseJsonMessage] JSON解析错误: ${error.message}`);
    return undefined;
  }
}

/**
 * 确保该方法在parseImage之后执行
 * @param {*} e
 * @returns
 */
export async function parseUrl_Visual(e) {
  if (!e.j_msg) return;
  // 更新正则表达式以匹配包含中文和空格的URL
  const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
  var matches;
  for (let i = 0; i < e.j_msg.notProcessed.length; i++) {
    if (e.j_msg.notProcessed[i].type === "text") {
      let message = e.j_msg.notProcessed[i].text;
      matches = message.match(urlRegex) || [];
      if (matches.length > 0) {
        // 替换原始消息
        for (let url of matches) {
          // 移除URL末尾的标点符号和中文字符
          let cleanUrl = url.replace(
            /[.,!?;:，。！？、；：\s\u4e00-\u9fa5]+$/,
            ""
          );
          // 处理URL中的空格和中文字符
          try {
            // 尝试解码URL，如果已经是解码状态则保持不变
            cleanUrl = decodeURIComponent(cleanUrl);
            // 重新编码空格和特殊字符，但保留中文字符
            cleanUrl = cleanUrl
              .replace(/\s+/g, "%20")
              .replace(/[[\](){}|\\^<>]/g, encodeURIComponent);
          } catch (e) {
            // 如果解码失败，说明URL可能已经是正确格式
            logger.warn(`[URL处理]URL解码失败: ${url} => ${cleanUrl}`);
          }
          // 跳过不需要提取内容的URL
          if (isSkippedUrl(cleanUrl)) {
            logger.info(`[URL处理]跳过URL: ${url} = ${cleanUrl}`);
            continue;
          }
          logger.info(`[URL处理]开始处理URL: ${url} = ${cleanUrl}`);
          const extractResult = await extractUrlContent(cleanUrl);
          if (extractResult) {
            logger.info(`[URL处理]成功提取URL内容`);
          }
          var config = getConfig();
          // 借助chatApi对提取的内容进行总结
          var apiKey = config.chatApiKey;
          var model = config.chatModel;
          var Constructor = chatMap[config.chatApi];
          var chatInstance = new Constructor();
          var result = await chatInstance[ChatInterface.generateRequest](
            apiKey,
            model,
            "根据从URL抓取的信息，以自然语言简练地总结URL中的主要内容，其中无关信息可以过滤掉",
            [{ role: "user", content: extractResult.content }],
            (useSystemRole = false)
          );
          e.j_msg.notProcessed[i].text = e.j_msg.notProcessed[i].text.replace(
            url,
            `<分享URL，URL内容的分析结果——${result}>`
          );
          e.j_msg.notProcessed[i].type = "url2text";
        }
      }
    }
  }
}

export async function parseText_Visual(e) {
  var msg = "";
  // notProcessed 中的文本提取成一个 text
  if (e.j_msg.notProcessed && e.j_msg.notProcessed.length > 0) {
    for (let i = 0; i < e.j_msg.notProcessed.length; i++) {
      if (e.j_msg.notProcessed[i].hasOwnProperty('text')) {
        msg += e.j_msg.notProcessed[i].text + " ";
        e.j_msg.notProcessed.splice(i, 1);
        i--;
      }
    }
    msg = msg.trim();
  }
  e.j_msg.text = msg;
}

/**
 * 检查URL是否为不需要提取内容的文件类型
 * @param {string} url URL地址
 * @returns {boolean} 是否为不需要提取的文件类型
 */
function isSkippedUrl(url) {
  // 检查常见图片后缀
  const imageExtensions =
    /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|tiff|tif|raw|cr2|nef|arw|dng|heif|heic|avif|jfif|psd|ai)$/i;

  // 检查常见视频后缀
  const videoExtensions =
    /\.(mp4|webm|mkv|flv|avi|mov|wmv|rmvb|m4v|3gp|mpeg|mpg|ts|mts)$/i;

  // 检查可执行文件和二进制文件
  const binaryExtensions =
    /\.(exe|msi|dll|sys|bin|dat|iso|img|dmg|pkg|deb|rpm|apk|ipa|jar|class|pyc|o|so|dylib)$/i;

  // 检查压缩文件
  const archiveExtensions =
    /\.(zip|rar|7z|tar|gz|bz2|xz|tgz|tbz|cab|ace|arc)$/i;

  // 检查是否包含媒体或下载相关路径关键词
  const skipKeywords =
    /\/(images?|photos?|pics?|videos?|medias?|downloads?|uploads?|binaries|assets)\//i;

  // 不跳过的URL类型
  const allowedExtensions = /(\.bilibili.com\/video|b23\.tv)\//i;

  return (
    !allowedExtensions.test(url) &&
    (imageExtensions.test(url) ||
      videoExtensions.test(url) ||
      binaryExtensions.test(url) ||
      archiveExtensions.test(url) ||
      skipKeywords.test(url))
  );
}

export async function getImageUniqueId(e) {
  let image = e.message.filter((item) => item.type === "image");
  if (image.length > 0) {
    return image[0].url;
  }
  return null;
}
