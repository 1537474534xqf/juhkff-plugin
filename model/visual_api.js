import Objects from "#juhkff.kits";
import { EMOTION_KEY } from "#juhkff.redis";
import setting from "#juhkff.setting";
import axios from "axios";
import fetch from "node-fetch";

export const VisualInterface = {
  generateRequest: Symbol("generateRequest"),
  getModelMap: Symbol("getModelMap"),
};

/**
 *
 * @param {string} visualApiKey 视觉 Api Key
 * @param {string} model 使用的视觉 API 模型
 * @param {string} image 输入的图片 base64
 */
VisualInterface.generateRequest = async function ({
  apiKey,
  model,
  j_msg,
  historyMessages = [],
  useSystemRole = true,
}) {};

VisualInterface.getModelMap = function () {};

class VisualApi {
  constructor() {
    this.Config = setting.getConfig("autoReply");
    this.ModelMap = {};
    this.ApiBaseUrl = undefined;
    // 默认情况下模型等信息在指定API后提供，禁止用户自行输入
    this.shouldInputSelf = false;
  }

  [VisualInterface.getModelMap]() {}

  async [VisualInterface.generateRequest]({
    apiKey,
    model,
    j_msg,
    historyMessages = [],
    useSystemRole = true,
  }) {}
}

export class Siliconflow extends VisualApi {
  constructor() {
    super();
    this.ApiBaseUrl = "https://api.siliconflow.cn/v1";
    if (this.Config.useVisual) this[VisualInterface.getModelMap]();
  }

  [VisualInterface.getModelMap]() {
    /*
    this.ModelMap = {};
    var responsePromise = axios.get(`${this.ApiBaseUrl}/models?type=image`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.Config.visualApiKey}`,
      },
    });
    responsePromise
      .then((response) => {
        var models = response.data.data;
        var modelMap = {};
        for (const model of models) {
          modelMap[model.id] = this.commonRequest.bind(this);
        }
        this.ModelMap = modelMap;
      })
      .catch((error) => {
        logger.error("[autoReply] 获取视觉模型失败：", error);
      });
    */
    // TODO SF官网的API竟然不能查询特定Tag，只能自己写在这了，时不时更新一下
    this.ModelMap = {
      "Qwen/Qwen2.5-VL-72B-Instruct": this.commonRequest.bind(this),
      "Pro/Qwen/Qwen2.5-VL-7B-Instruct": this.commonRequest.bind(this),
      "Qwen/QVQ-72B-Preview": this.commonRequest.bind(this),
      "Qwen/Qwen2-VL-72B-Instruct": this.commonRequest.bind(this),
      "deepseek-ai/deepseek-vl2": this.commonRequest.bind(this),
      "Pro/Qwen/Qwen2-VL-7B-Instruct": this.commonRequest.bind(this),
    };
  }

  async [VisualInterface.generateRequest]({
    apiKey,
    model,
    j_msg,
    historyMessages = [],
    useSystemRole = true,
  }) {
    if (!this.ModelMap[model]) {
      logger.error("[autoReply]不支持的视觉模型：" + model);
      return "[autoReply]不支持的视觉模型：" + model;
    }
    var request = {
      url: `${this.ApiBaseUrl}/chat/completions`,
      options: {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: {
          model: model,
          messages: [],
          stream: false,
        },
      },
    };

    var response = await this.ModelMap[model](
      JSON.parse(JSON.stringify(request)),
      j_msg,
      historyMessages,
      useSystemRole
    );
    return response;
  }

  async commonRequest(request, j_msg, historyMessages, useSystemRole) {
    if (useSystemRole) {
      var systemContent = await generateSystemContent(
        this.Config.useEmotion,
        this.Config.chatPrompt
      );
      request.options.body.messages.push(systemContent);
    }
    // 添加历史对话
    if (historyMessages && historyMessages.length > 0) {
      historyMessages.forEach((history) => {
        var content = [];
        var hasContent = false;
        var msg = history.content;
        if (!Objects.isNull(msg.sourceImg)) {
          for (const img of msg.sourceImg) {
            content.push({
              type: "image_url",
              image_url: {
                detail: "auto",
                url: img,
              },
            });
          }
          content.push({
            type: "text",
            text: "以上为引用消息中的图片",
          });
          hasContent = true;
        }
        if (!Objects.isNull(msg.img)) {
          for (const img of msg.img) {
            content.push({
              type: "image_url",
              image_url: {
                detail: "auto",
                url: img,
              },
            });
          }
          hasContent = true;
        }
        // TODO 引用消息文本和消息正文拼接，不参与描述引用图片，先按这种逻辑实现试试
        var finalMsg = "";
        if (!Objects.isNull(msg.sourceText)) finalMsg += msg.sourceText;
        if (!Objects.isNull(msg.text)) finalMsg += msg.text;
        if (!Objects.isNull(finalMsg)) {
          if (history.role == "assistant") {
            // TODO 机器人的记录如果添加上时间戳和昵称，生成的结果容易也包含这些，看上去就很假
            content.push({
              type: "text",
              text: finalMsg,
            });
          } else {
            content.push({
              type: "text",
              text: history.time + " - " + history.nickName + "：" + finalMsg,
            });
          }
          hasContent = true;
        }
        // TODO 如果content只有notProcessed部分有内容，例如发送默认表情(type==face)情况，就直接跳过不加
        if (hasContent) {
          request.options.body.messages.push({
            role: history.role,
            content: content,
          });
        }
      });
    }
    // j_msg = {sourceImg: [], sourceText: "", img: [], text: "", notProcessed: []}
    // 添加消息内容
    var content = [];
    if (!Objects.isNull(j_msg.sourceImg)) {
      for (const img of j_msg.sourceImg) {
        content.push({
          type: "image_url",
          image_url: {
            detail: "auto",
            url: img,
          },
        });
      }
      content.push({
        type: "text",
        text: "以上为引用消息中的图片",
      });
    }
    if (!Objects.isNull(j_msg.img)) {
      for (const img of j_msg.img) {
        content.push({
          type: "image_url",
          image_url: {
            detail: "auto",
            url: img,
          },
        });
      }
    }
    // TODO 引用消息文本和消息正文拼接，不参与描述引用图片，先按这种逻辑实现试试
    var finalMsg = j_msg.sourceText + j_msg.text;
    if (!Objects.isNull(finalMsg)) {
      content.push({
        type: "text",
        text: finalMsg,
      });
    }

    request.options.body.messages.push({
      role: "user",
      content: content,
    });

    logger.mark(`[autoReply]视觉模型API调用`);
    var response;
    try {
      request.options.body = JSON.stringify(request.options.body);
      response = await fetch(request.url, request.options);

      const data = await response.json();

      if (data?.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      } else {
        logger.error(
          "[autoReply]视觉模型API调用失败：",
          JSON.stringify(data, null, 2)
        );
        return "[autoReply]视觉模型API调用失败，详情请查阅控制台。";
      }
    } catch (error) {
      logger.error(
        `[autoReply]视觉模型API调用失败, 请求返回结果：${JSON.stringify(
          response
        )}\n`,
        error
      );
      return "[autoReply]视觉模型API调用失败，详情请查阅控制台。";
    }
  }
}

/************************** 函数调用 **************************/

/**
 * 生成 role = system 的内容
 * @param {*} useEmotion 是否使用情感
 * @param {*} chatPrompt 聊天预设
 * @returns `{role: 'system', content: ["type":"text","text":"xxx"]}`
 */
async function generateSystemContent(useEmotion, chatPrompt) {
  if (Objects.isNull(chatPrompt))
    chatPrompt =
      "You are a helpful assistant, you must speak Chinese. Now you are in a chat group, and the following is chat history";
  var emotionPrompt = await redis.get(EMOTION_KEY);
  return {
    role: "system",
    content: [
      {
        type: "text",
        text: useEmotion
          ? `${chatPrompt} \n 你的情感倾向——${emotionPrompt
              .replace(/\n/g, "")
              .replace(/\s+/g, "")}`
          : chatPrompt,
      },
    ],
  };
}

export const visualMap = {
  siliconflow: new Siliconflow(),
};
