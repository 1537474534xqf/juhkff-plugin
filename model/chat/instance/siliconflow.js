import { ChatApi, ChatInterface, generateSystemContent } from "../chatApi.js";
import axios from "axios";
import fetch from "node-fetch";

class Siliconflow extends ChatApi {
    constructor() {
        super();
        this.ApiBaseUrl = "https://api.siliconflow.cn/v1";
        if (this.Config.chatApi == "siliconflow") this[ChatInterface.getModelMap]();
    }

    [ChatInterface.getModelMap]() {
        this.ModelMap = {};
        var responsePromise = axios.get(`${this.ApiBaseUrl}/models?type=text`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.Config.chatApiKey}`,
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

    async [ChatInterface.generateRequest]({
        apiKey,
        model,
        input,
        historyMessages = [],
        image_list = {},
        image_type = false,
        useSystemRole = true
    }) {
        // 构造请求体
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
                    temperature: 1.5,
                },
            },
        };

        // var response = await this.ModelMap[model](
        var response = await this.commonRequest(
            request,
            input,
            historyMessages,
            image_list,
            image_type,
            useSystemRole
        );
        return response;
    }
    async commonRequest(
        request,
        input,
        historyMessages = [],
        image_list = {},
        image_type = false,
        useSystemRole
    ) {
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
                // 不是图片时添加
                if (!msg.imageBase64) {
                    request.options.body.messages.push({
                        role: msg.role,
                        content: msg.content,
                    });
                }
            });
        }
        request.options.body.messages.push({
            role: "user",
            content: input,
        });

        logger.info(
            `\n[autoReply]Siliconflow API调用，请求内容：${JSON.stringify(
                request,
                null,
                2
            )}`
        );

        var response;
        try {
            request.options.body = JSON.stringify(request.options.body);
            response = await fetch(request.url, request.options);

            const data = await response.json();

            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            } else {
                logger.error(
                    "[autoReply]Siliconflow调用失败：",
                    JSON.stringify(data, null, 2)
                );
                return "[autoReply]Siliconflow调用失败，详情请查阅控制台。";
            }
        } catch (error) {
            logger.error(
                `[autoReply]Siliconflow调用失败, 请求返回结果：${JSON.stringify(
                    response
                )}\n`,
                error
            );
            return "[autoReply]Siliconflow调用失败，详情请查阅控制台。";
        }
    }
}

const Instance = new Siliconflow();
export default Instance;