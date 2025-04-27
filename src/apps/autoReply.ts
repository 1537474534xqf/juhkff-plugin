import { sleep } from "../bgProcess/timer";
import { AutoReply } from "../config/define/autoReply";
import setting from "../model/setting";
import { formatDateDetail } from "../utils/date";
import { generateAnswer, parseImage, parseJson, parseSourceMessage, parseUrl, saveContext } from "../utils/handle";
import { generateAnswerVisual, parseImageVisual, parseJsonVisual, parseSourceMessageVisual, parseTextVisual, parseUrlVisual, saveContextVisual } from "../utils/handleVisual";
import { Objects } from "../utils/kits";

export const help = () => {
    return {
        name: "主动群聊",
        type: "passive",
        dsc: "假装人类发言",
        enable: (setting.getConfig("autoReply") as AutoReply).useAutoReply,
    }
}

/**
 * 主动群聊插件
 * @author Bilibili - 扎克芙芙
 */
export class autoReply extends plugin {
    // 构建正则匹配等
    constructor() {
        super({
            name: "[扎克芙芙]主动回复群聊",
            dsc: "主动回复群聊",
            event: "message",
            priority: 9999, // 优先级，越小越先执行
            rule: [
                {
                    reg: "^((?!#).)*$", // 匹配所有非#开头的文本
                    fnc: "autoReply",
                    log: false,
                },
            ],
        });
        if (this.Config.useEmotion) {
            this.task = Object.defineProperties(
                {},
                {
                    cron: { value: this.Config.emotionGenerateTime, writable: false },
                    name: { value: "情感生成", writable: false },
                    fnc: { value: () => this.emotionGenerate(), writable: false },
                    log: { get: () => false },
                }
            );
        }
    }

    get Config(): AutoReply {
        return setting.getConfig("autoReply");
    }

    async autoReply(e: any) {
        if (!this.Config.useAutoReply) return false;
        if (e.message_type != "group") return false;
        if (this.Config.useVisual && this.Config.visualReplaceChat) {
            await this.visualProcess(e);
        } else {
            await this.commonProcess(e);
        }
    }

    /**
     * @description: 通用处理（不使用视觉模型覆盖原接口）
     * @param {*} e
     * @returns
     */
    async commonProcess(e: any) {
        // 避免重复保存上下文
        // 借助siliconflow-plugin保存群聊上下文
        var time = Date.now();
        let chatDate = await formatDateDetail(time);
        await parseImage(e);
        // 处理引用消息，获取图片和文本
        await parseSourceMessage(e);
        // 处理分享链接
        await parseJson(e);
        if (this.Config.attachUrlAnalysis) {
            // 处理URL
            await parseUrl(e);
        }
        // 通过自定义的e.j_msg拼接完整消息内容
        var msg = e.j_msg.map((msg: { text: string }) => msg.text).join(" ");
        logger.info(`[autoReply]解析后的消息内容: ${msg}`);

        if (msg) msg = msg.trim();
        if (Objects.isNull(msg)) {
            // logger.info('[潜伏模板]非通常消息，不回复')
            return false;
        }

        var chatRate = this.Config.defaultChatRate; // 主动回复概率
        var replyAtBot = this.Config.defaultReplyAtBot; // 是否回复@机器人的消息
        // 如果 groupRate 配置存在且不为空
        if (this.Config.groupChatRate && this.Config.groupChatRate.length > 0) {
            for (var config of this.Config.groupChatRate) {
                // 确保 config.groupList 是数组，以避免 undefined 的情况
                if (
                    Array.isArray(config.groupList) &&
                    config.groupList.includes(e.group_id)
                ) {
                    // if(config.chatRate) 会将0概率认为是为false，改成如下写法
                    if (config.chatRate !== undefined && config.chatRate !== null)
                        chatRate = config.chatRate;
                    if (config.replyAtBot !== undefined && config.replyAtBot !== null)
                        replyAtBot = config.replyAtBot;
                    break;
                }
            }
        }

        var answer = undefined;
        var answer_time = undefined;
        // 如果@了bot，就直接回复
        if ((e.atBot && replyAtBot) || Math.random() < Number(chatRate)) {
            answer = await generateAnswer(e, msg);
            if (!e.atBot && (!answer || answer.startsWith("[autoReply]"))) {
                // 如果自主发言失败不提示
            } else {
                await this.handleReply(e, answer);
                answer_time = Date.now();
            }
        }
        if (this.Config.useContext) {
            // 保存用户消息
            var content = chatDate + " - " + e.sender.card + "：" + msg;
            await saveContext(time, e.group_id, e.message_id, "user", content);
            // 保存AI回复
            if (answer && !answer.startsWith("[autoReply]")) {
                await saveContext(answer_time!, e.group_id, 0, "assistant", answer);
            }
        }
        return false;
    }

    /**
     * @description: 视觉模型处理
     * @param {*} e
     */
    async visualProcess(e: any) {
        // 避免重复保存上下文
        // 借助siliconflow-plugin保存群聊上下文
        var time = Date.now();
        let chatDate = await formatDateDetail(time);
        await parseImageVisual(e);
        // 处理引用消息，获取图片和文本
        await parseSourceMessageVisual(e);
        // 处理分享链接
        await parseJsonVisual(e);
        if (this.Config.attachUrlAnalysis) {
            // 处理URL
            await parseUrlVisual(e);
        }
        // 通过自定义的e.j_msg拼接完整消息内容
        await parseTextVisual(e);

        var chatRate = this.Config.defaultChatRate; // 主动回复概率
        var replyAtBot = this.Config.defaultReplyAtBot; // 是否回复@机器人的消息
        // 如果 groupRate 配置存在且不为空
        if (this.Config.groupChatRate && this.Config.groupChatRate.length > 0) {
            for (var config of this.Config.groupChatRate) {
                // 确保 config.groupList 是数组，以避免 undefined 的情况
                if (
                    Array.isArray(config.groupList) &&
                    config.groupList.includes(e.group_id)
                ) {
                    // if(config.chatRate) 会将0概率认为是为false，改成如下写法
                    if (config.chatRate !== undefined && config.chatRate !== null)
                        chatRate = config.chatRate;
                    if (config.replyAtBot !== undefined && config.replyAtBot !== null)
                        replyAtBot = config.replyAtBot;
                    break;
                }
            }
        }

        var answer = undefined;
        var answer_time = undefined;
        var answer_date = undefined;
        // 如果@了bot，就直接回复
        if ((e.atBot && replyAtBot) || Math.random() < Number(chatRate)) {
            answer = await generateAnswerVisual(e);
            if (!e.atBot && (!answer || answer.startsWith("[autoReply]"))) {
                // 如果自主发言失败不提示
            } else {
                await this.handleReply(e, answer);
                answer_time = Date.now();
                answer_date = formatDateDetail(answer_time);
            }
        }
        if (this.Config.useContext) {
            // 保存用户消息
            await saveContextVisual(
                time,
                chatDate,
                e.group_id,
                e.message_id,
                "user",
                e.sender.card,
                e.j_msg
            );
            // 保存AI回复
            if (answer && !answer.startsWith("[autoReply]")) {
                await saveContextVisual(
                    answer_time!,
                    answer_date,
                    e.group_id,
                    0,
                    "assistant",
                    "群BOT", // TODO 机器人的nickName，以后可以添加自定义名称的功能，现在该项暂时没用
                    {
                        text: answer,
                    }
                );
            }
        }
        return false;
    }

    /**
     * 对已经生成的消息进行发送前处理
     * @param {*} e 
     * @param {*} answer 
     */
    async handleReply(e: any, answer: string) {
        // 如果为连续短句，概率间隔发送，感觉这样更真实一点
        if (answer.split(" ").length > 1 && Math.random() < 0.5) {
            var answerList = answer.split(" ");
            for (var i = 0; i < answerList.length; i++) {
                var each = answerList[i];
                await e.reply(each);
                await sleep((-0.5 + Math.random()) * 2 * 1000 * 4 + 5000);  // 随机延迟，范围(1s,9s)
            }
            return;
        }
        await e.reply(answer);
    }
}
