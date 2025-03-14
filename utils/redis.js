export async function get_source_message(groupId, message_id) {
  try {
    // 获取该群的所有消息
    const keys = await redis.keys(`juhkff:auto_reply:${groupId}:*`);
    keys.sort((a, b) => {
      const timeA = parseInt(a.split(":")[3]);
      const timeB = parseInt(b.split(":")[3]);
      return timeA - timeB; // 按时间戳升序排序
    });

    for (const key of keys) {
      const data = await redis.get(key);
      var msg = JSON.parse(data);
      if (msg.message_id == message_id) {
        return msg.content;
      }
    }
    return undefined;
  } catch (error) {
    logger.error("[redis.js]加载redis失败:", error);
    return undefined;
  }
}

export const EMOTION_KEY = `juhkff:auto_reply:emotion`;
