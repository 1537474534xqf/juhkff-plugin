import { ChatApi, ChatInterface, generateSystemContent } from "../chatApi.js";
import fetch from "node-fetch";

class ArkEngine extends ChatApi {
    constructor() {
        super();
        // 需要用户自行输入模型等信息
        this.shouldInputSelf = true;
    }

    // 自定义模型，不依靠成员变量
    [ChatInterface.getModelMap]() { }

    async [ChatInterface.generateRequest]({
        apiKey,
        model,
        input,
        historyMessages = [],
        image_list = {},
        image_type = false,
        useSystemRole = true,
    }) {
        // 构造请求体
        var request = {
            url: `${this.Config.apiCustomUrl}`,
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
        // 调用返回结果的头尾容易有换行符，进行处理
        response = response.replace(/^\n+|\n+$/g, "");
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

        logger.mark(
            `\n[autoReply]火山方舟 API调用，请求内容：${JSON.stringify(
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
                    "[autoReply]火山方舟调用失败：",
                    JSON.stringify(data, null, 2)
                );
                return "[autoReply]火山方舟调用失败，详情请查阅控制台。";
            }
        } catch (error) {
            logger.error(
                `[autoReply]火山方舟调用失败, 请求返回结果：${JSON.stringify(
                    response
                )}\n`,
                error
            );
            return "[autoReply]火山方舟调用失败，详情请查阅控制台。";
        }
    }
}

const Instance = new ArkEngine();
export default Instance;