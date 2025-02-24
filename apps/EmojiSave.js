import fs from "fs";
import setting from "#juhkff.setting";
import { downloadFile } from "#juhkff.net";
import { _path, pluginResources, pluginRoot } from "#juhkff.path";

/**
 * 表情保存插件
 * @author Bilibili - 扎克芙芙
 */
export class EmojiSave extends plugin {
  constructor() {
    super({
      name: "[扎克芙芙]表情保存",
      dsc: "指定时间（默认三天）内发送过两次（不包含引用）的图片自动保存并随机发送",
      event: "message",
      priority: 2,
      rule: [
        {
          reg: "",
          fnc: "emojiSave",
          log: false,
        },
      ],
    });
  }

  get Config() {
    return setting.getConfig("emojiSave");
  }

  async emojiSave(e) {
    let emojiSaveDir = `${pluginRoot}/data/${e.group_id}/emoji_save`;
    let replyRate = this.Config.defaultReplyRate; // 回复表情概率
    let emojiRate = this.Config.defaultEmojiRate; // 发送偷的图的概率
    let groupMatched = false;

    // 如果 groupRate 配置存在且不为空
    if (this.Config.groupRate && this.Config.groupRate.length > 0) {
      for (let config of this.Config.groupRate) {
        // 确保 config.groupList 是数组，以避免 undefined 的情况
        if (
          Array.isArray(config.groupList) &&
          config.groupList.includes(e.group_id)
        ) {
          if (config.replyRate) replyRate = config.replyRate;
          if (config.emojiRate) emojiRate = config.emojiRate;
          groupMatched = true;
          break;
        }
      }
    }

    const expireTimeInSeconds = this.Config.expireTimeInSeconds;
    await fs.promises.mkdir(emojiSaveDir, { recursive: true });
    let list = await fs.promises.readdir(emojiSaveDir);

    // 处理消息的每一项
    for (const item of e.message) {
      if (item.type === "image" && item.file_size < 100000) {
        if (!item.file_unique) item.file_unique = item.file.split(".")[0];
        try {
          list = list ? list : [];
          if (!list.includes(`${item.file_unique}.jpg`)) {
            let can_be_stored = false;
            if (
              !(await redis.get(`EmojiSave:${e.group_id}:${item.file_unique}`))
            ) {
              //key不存在，设置key
              await redis.set(
                `EmojiSave:${e.group_id}:${item.file_unique}`,
                "1",
                {
                  EX: expireTimeInSeconds,
                }
              );
              logger.info(`[EmojiSave]待二次确认: ${item.file_unique}`);
            } else {
              // key存在，二次确认成功
              await redis.del(`EmojiSave:${e.group_id}:${item.file_unique}`);
              can_be_stored = true;
              logger.info(`[EmojiSave]二次确认成功: ${item.file_unique}`);
            }
            if (!can_be_stored) continue;
            logger.info("[EmojiSave]存储表情");
            let imgType = item.file.split(".").pop();
            await downloadFile(
              item.url,
              `${emojiSaveDir}/${item.file_unique}.${imgType}`
            );
            list.push(`${item.file_unique}.${imgType}`);
            if (list.length > 50) {
              const randomIndex = Math.floor(Math.random() * list.length);
              const randomFile = list[randomIndex];
              fs.unlinkSync(`${emojiSaveDir}/${randomFile}`);
              list.splice(randomIndex, 1);
              logger.info(`[EmojiSave]存储过多，删除表情: ${randomFile}`);
            }
          }
        } catch (error) {
          logger.error(`[EmojiSave]出错: ${error}`);
        }
      }
    }

    // 发送表情包的概率判断
    if (Math.random() < replyRate) {
      try {
        // 有表情包的情况下才继续
        if (list.length > 0 && Math.random() < Number(emojiRate)) {
          let randomIndex = Math.floor(Math.random() * list.length);
          var emojiUrl = `${emojiSaveDir}/${list[randomIndex]}`;
          logger.info(`[EmojiSave]发送表情: ${emojiUrl}`);
          e.reply([segment.image(emojiUrl)]);
        }
      } catch (error) {
        logger.error(`[EmojiSave]表情发送失败: ${error}`);
      }
    }

    // 继续执行后续的插件
    return false;
  }
}
