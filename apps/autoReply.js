import setting from "#juhkff.setting";
import {
  parseImage,
  parseSourceMessage,
  parseJson,
  parseUrl,
} from "#juhkff.handle";
import { formatDateDetail } from "#juhkff.date";
import { ChatInterface, chatMap } from "#juhkff.api.chat";
import Objects from "#juhkff.kits";
import { EMOTION_KEY } from "#juhkff.redis";

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
      priority: 9999,
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

  get Config() {
    return setting.getConfig("autoReply");
  }

  async autoReply(e) {
    if(!this.Config.useAutoReply) return false;
    if (e.message_type != "group") return false;
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
    var msg = e.j_msg.map((msg) => msg.text).join(" ");
    logger.info(`[autoReply]解析后的消息内容: ${msg}`);

    if (msg) msg = msg.trim();
    if (!msg || msg == "") {
      // logger.info('[潜伏模板]非通常消息，不回复')
      return false;
    }

    let chatRate = this.Config.defaultChatRate; // 主动回复概率
    // 如果 groupRate 配置存在且不为空
    if (this.Config.groupChatRate && this.Config.groupChatRate.length > 0) {
      for (let config of this.Config.groupChatRate) {
        // 确保 config.groupList 是数组，以避免 undefined 的情况
        if (
          Array.isArray(config.groupList) &&
          config.groupList.includes(e.group_id)
        ) {
          if (config.chatRate) chatRate = config.chatRate;
          break;
        }
      }
    }

    var answer = undefined;
    var answer_time = undefined;
    // 如果@了bot，就直接回复
    if (e.atBot || Math.random() < Number(chatRate)) {
      answer = await this.generate_answer(e, msg);
      if (!e.atBot && (!answer || answer.startsWith("[autoReply]"))) {
        // 如果自主发言失败不提示
      } else {
        await e.reply(answer);
        answer_time = Date.now();
      }
    }
    if (this.Config.useContext) {
      // 保存用户消息
      var content = chatDate + " - " + e.sender.card + "：" + msg;
      await this.saveContext(time, e.group_id, e.message_id, "user", content);
      // 保存AI回复
      if (answer && !answer.startsWith("[autoReply]")) {
        await this.saveContext(answer_time, e.group_id, 0, "assistant", answer);
      }
    }
    return false;
  }

  /**
   *
   * @param {*} e
   * @param {*} msg 正文消息
   * @param {*} sourceImages 引用图片数组
   * @param {*} currentImages 正文图片数组
   * @returns answer 回复内容
   */
  async generate_answer(e, msg) {
    var chatApi = this.Config.chatApi;
    let apiKey = this.Config.chatApiKey;
    let model = this.Config.chatModel;
    if (!apiKey || apiKey == "") {
      logger.error("[autoReply]请先在autoReply.yaml中设置chatApiKey");
      return "[autoReply]请先在autoReply.yaml中设置chatApiKey";
    }
    if (!model || model == "") {
      logger.error("[autoReply]请先在autoReply.yaml中设置chatModel");
      return "[autoReply]请先在autoReply.yaml中设置chatModel";
    }

    // 获取历史对话
    let historyMessages = [];
    if (this.Config.useContext) {
      historyMessages = await this.loadContext(e.group_id);
      logger.info(`[autoReply]加载历史对话: ${historyMessages.length} 条`);
    }

    // 如果启用了情感，并且redis中不存在情感，则进行情感生成
    if (
      this.Config.useEmotion &&
      Objects.isNull(await redis.get(EMOTION_KEY))
    ) {
      redis.set(EMOTION_KEY, await this.emotionGenerate(), {
        EX: 24 * 60 * 60,
      });
    }

    let answer = await this.sendChatRequest(
      e.sender.card + "：" + msg,
      chatApi,
      apiKey,
      model,
      historyMessages
    );
    // 使用正则表达式去掉字符串 answer 开头的换行符
    answer = answer.replace(/^\n/, "");
    return answer;
  }

  /**
   * @description: 自动提示词
   * @param {*} input
   * @param {*} chatApi 使用的AI接口
   * @param {*} apiKey
   * @param {*} model 使用的API模型
   * @param {*} opt 图片参数
   * @return {string}
   */
  async sendChatRequest(
    input,
    chatApi,
    apiKey,
    model = "",
    historyMessages = [],
    useSystemRole = true
  ) {
    var chatInstance = chatMap[chatApi];
    if (!chatInstance) return "[autoReply]请在autoReply.yaml中设置有效的AI接口";
    var result = await chatInstance[ChatInterface.generateRequest]({
      apiKey,
      model,
      input,
      historyMessages,
      useSystemRole,
    });
    return result;
  }

  // 保存对话上下文
  async saveContext(time, groupId, message_id = 0, role, message) {
    try {
      const maxHistory = this.Config.maxHistoryLength;
      const key = `juhkff:auto_reply:${groupId}:${time}`;

      // message_id = 0时，表示是AI回复
      var saveContent = {
        message_id: message_id,
        role: role,
        content: message,
      };
      await redis.set(key, JSON.stringify(saveContent), { EX: 12 * 60 * 60 }); // 12小时过期

      // 获取该群的所有消息
      var keys = await redis.keys(`juhkff:auto_reply:${groupId}:*`);
      keys.sort((a, b) => {
        const timeA = parseInt(a.split(":")[3]);
        const timeB = parseInt(b.split(":")[3]);
        return timeB - timeA; // 按时间戳降序排序
      });

      // 如果超出限制，删除旧消息
      if (keys.length > maxHistory) {
        const keysToDelete = keys.slice(maxHistory);
        for (const key of keysToDelete) {
          await redis.del(key);
        }
      }

      return true;
    } catch (error) {
      logger.error("[autoReply]保存上下文失败:", error);
      return false;
    }
  }

  // 加载群历史对话
  async loadContext(groupId) {
    try {
      const maxHistory = this.Config.maxHistoryLength;

      // 获取该群的所有消息
      const keys = await redis.keys(`juhkff:auto_reply:${groupId}:*`);
      keys.sort((a, b) => {
        const timeA = parseInt(a.split(":")[3]);
        const timeB = parseInt(b.split(":")[3]);
        return timeA - timeB; // 按时间戳升序排序
      });

      // 只获取最近的N条消息
      const recentKeys = keys.slice(-maxHistory);
      const messages = [];

      for (const key of recentKeys) {
        const data = await redis.get(key);
        if (data) {
          messages.push(JSON.parse(data));
        }
      }

      return messages;
    } catch (error) {
      logger.error("[autoReply]加载上下文失败:", error);
      return [];
    }
  }

  /**
   * @description: 情感生成
   * @param {*}
   * @return {*}
   * @author: JUHKFF
   */
  async emotionGenerate() {
    var chatApi = this.Config.chatApi;
    let apiKey = this.Config.chatApiKey;
    let model = this.Config.chatModel;
    if (Objects.hasNull(chatApi, apiKey, model)) {
      return null;
    }
    var emotion = await this.sendChatRequest(
      this.Config.emotionGeneratePrompt,
      chatApi,
      apiKey,
      model,
      [],
      false
    );
    logger.info(`[autoReply]情感生成: ${emotion}`);
    return emotion;
  }
}
