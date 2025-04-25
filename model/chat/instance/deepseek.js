import { ChatApi, ChatInterface,generateSystemContent } from "../chatApi.js";
import fetch from "node-fetch";

class DeepSeek extends ChatApi {
    constructor() {
        super();
        this.ApiBaseUrl = "https://api.deepseek.com/";
        if (this.Config.chatApi == "deepseek") this[ChatInterface.getModelMap]();
    }

    [ChatInterface.getModelMap]() {
        this.ModelMap = {
            "deepseek-chat": this.deepseek_chat.bind(this),
            "deepseek-reasoner": this.deepseek_reasoner.bind(this),
        };
    }

    async [ChatInterface.generateRequest]({
        apiKey,
        model,
        input,
        historyMessages = [],
        image_list = {},
        image_type = false,
        useSystemRole = true,
    }) {
        if (!this.ModelMap[model]) {
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
                    temperature: 1.5,
                },
            },
        };

        var response = await this.ModelMap[model](
            request,
            input,
            historyMessages,
            image_list,
            image_type,
            useSystemRole
        );
        // 如果 DeepSeek-R1 失败，尝试使用 DeepSeek-V3

        if (
            typeof response === "string" &&
            response.startsWith("[autoReply]DeepSeek-R1调用失败")
        ) {
            request.options.body.model = "deepseek-chat";
            response = await this.deepseek_chat(
                JSON.parse(JSON.stringify(request)),
                input,
                historyMessages,
                image_list,
                image_type
            );
        }
        return response;
    }

    async deepseek_chat(
        request,
        input,
        historyMessages = [],
        image_list = {},
        image_type = false,
        useSystemRole
    ) {
        // 添加消息内容
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
            // 添加当前对话
            request.options.body.messages.push({
                role: "user",
                content: input,
            });
        }
        logger.mark(
            `\n[autoReply]DeepSeek-V3 API调用，请求内容：${JSON.stringify(
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
                    "[autoReply]DeepSeek-V3调用失败：",
                    JSON.stringify(data, null, 2)
                );
                return "[autoReply]DeepSeek-V3调用失败，详情请查阅控制台。";
            }
        } catch (error) {
            logger.error(
                `[autoReply]DeepSeek-V3调用失败, 请求返回结果：${JSON.stringify(
                    response
                )}\n`,
                error
            );
            return "[autoReply]DeepSeek-V3调用失败，详情请查阅控制台。";
        }
    }

    async deepseek_reasoner(
        request,
        input,
        historyMessages = [],
        image_list = {},
        image_type = false,
        useSystemRole
    ) {
        // 添加消息内容
        if (useSystemRole) {
            var systemContent = await generateSystemContent(
                this.Config.useEmotion,
                this.Config.chatPrompt
            );
            request.options.body.messages.push(systemContent);
        }
        // 添加历史对话
        var content = "";
        if (historyMessages && historyMessages.length > 0) {
            content += historyMessages
                .filter((msg) => !msg.imageBase64)
                .map((msg) => `"role": "${msg.role}", "content": "${msg.content}",\n`)
                .join("");
            content += `"role": "user", "content": "${input}"`;
        } else {
            content = input;
        }
        request.options.body.messages.push({
            role: "user",
            content: content,
        });

        logger.mark(
            `\n[autoReply]DeepSeek-R1 API调用，请求内容：${JSON.stringify(
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
                    "[autoReply]DeepSeek-R1调用失败：",
                    JSON.stringify(data, null, 2)
                );
                return "[autoReply]DeepSeek-R1调用失败，详情请查阅控制台。";
            }
        } catch (error) {
            logger.error(
                `[autoReply]DeepSeek-R1调用失败, 请求返回结果：${JSON.stringify(
                    response
                )}\n`,
                error
            );
            return "[autoReply]DeepSeek-R1调用失败，详情请查阅控制台。";
        }
    }
}

const Instance = new DeepSeek();
export default Instance;