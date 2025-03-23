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
  input,
  historyMessages = [],
  useSystemRole = true
}) { };

VisualInterface.getModelMap = function () { };

class VisualApi {
  constructor() {
    this.Config = setting.getConfig("autoReply");
    this.ModelMap = {};
    this.ApiBaseUrl = undefined;
    // 默认情况下模型等信息在指定API后提供，禁止用户自行输入
    this.shouldInputSelf = false;
  }

  [VisualInterface.getModelMap]() { }

  async [VisualInterface.generateRequest]({
    apiKey,
    model,
    input,
    historyMessages = [],
    useSystemRole = true
  }) { }
}


export class Siliconflow extends VisualApi {
  constructor() {
    super();
    this.ApiBaseUrl = "https://api.siliconflow.cn/v1";
    if (this.Config.useVisual) this[VisualInterface.getModelMap]();
  }

  [VisualInterface.getModelMap]() {
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
        logger.error("[autoReply] 获取模型失败：", error);
      });
  }

  async [VisualInterface.generateRequest]({
    apiKey,
    model,
    input,
    historyMessages = [],
    useSystemRole = true
  }) {
    if (!this.modelMap[model]) {
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

    var response = await this.modelMap[model](
      JSON.parse(JSON.stringify(request)),
      input,
      historyMessages,
      useSystemRole
    );
    return response;
  }

  async commonRequest(request, input, historyMessages, useSystemRole) {
    if (useSystemRole) {
      var systemContent = await generateSystemContent(
        this.Config.useEmotion,
        this.Config.chatPrompt
      );
      request.options.body.messages.push(systemContent);
    }
    // 添加历史对话
    if (historyMessages && historyMessages.length > 0) {
      historyMessages.forEach((msg) => {
        request.options.body.messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }
    // 添加消息内容
    request.options.body.messages.push({
      role: "user",
      content: input,
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
    // todo 按deepseek-r1的模板修正格式，之后有问题再说
    content: [{
      type: "text",
      text: useEmotion ? `${chatPrompt} \n 你的情感倾向——${emotionPrompt.replace(/\n/g, "").replace(/\s+/g, "")}` : chatPrompt
    }]
  };
}

export const visualMap = {
  siliconflow: Siliconflow,
};
