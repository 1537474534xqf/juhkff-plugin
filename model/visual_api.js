import fetch from "node-fetch";

export const VisualInterface = {
  generateRequest: Symbol("generateRequest"),
};

/**
 *
 * @param {string} visualApiKey 视觉 Api Key
 * @param {string} model 使用的视觉 API 模型
 * @param {string} image 输入的图片 base64
 */
VisualInterface.generateRequest = async function (
  apiKey,
  model,
  image,
  input
) {};

export class Siliconflow {
  constructor() {
    // 模型映射
    this.modelMap = {
      "Qwen/Qwen2-VL-72B-Instruct": this.qwen2_vl_72b_instruct.bind(this),
    };
    this.ApiBaseUrl = "https://api.siliconflow.cn/v1";
  }

  async [VisualInterface.generateRequest](apiKey, model, image, input) {
    if (!this.modelMap[model]) {
      logger.error("[autoReply]不支持的模型：" + model);
      return "[autoReply]不支持的模型：" + model;
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
      image,
      input
    );
    // 如果 DeepSeek-R1 失败，尝试使用 DeepSeek-V3
    return response;
  }

  async qwen2_vl_72b_instruct(request, image, input) {
    // 添加消息内容
    request.options.body.messages.push({
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: image,
          },
        },
        {
          type: "text",
          text: input,
        },
      ],
    });

    logger.mark(`[autoReply]Qwen/Qwen2-VL-72B-Instruct API调用`);
    var response;
    try {
      request.options.body = JSON.stringify(request.options.body);
      response = await fetch(request.url, request.options);

      const data = await response.json();

      if (data?.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      } else {
        logger.error(
          "[autoReply]Qwen/Qwen2-VL-72B-Instruct调用失败：",
          JSON.stringify(data, null, 2)
        );
        return "[autoReply]Qwen/Qwen2-VL-72B-Instruct调用失败，详情请查阅控制台。";
      }
    } catch (error) {
      logger.error(
        `[autoReply]Qwen/Qwen2-VL-72B-Instruct调用失败, 请求返回结果：${JSON.stringify(
          response
        )}\n`,
        error
      );
      return "[autoReply]Qwen/Qwen2-VL-72B-Instruct调用失败，详情请查阅控制台。";
    }
  }
}

export const visualMap = {
  siliconflow: Siliconflow,
};

export const apiList = {
  siliconflow: "https://api.siliconflow.cn/v1",
};
