export async function getSourceMessage(
    groupId: number | string,
    message_id: number | string,
    returnFullMessage = false
): Promise<any> {
    try {
        // 获取该群的所有消息
        const keys = await redis.keys(`juhkff:auto_reply:${groupId}:*`);
        keys.sort((a: string, b: string) => {
            const timeA = parseInt(a.split(":")[3]);
            const timeB = parseInt(b.split(":")[3]);
            return timeA - timeB; // 按时间戳升序排序
        });

        for (const key of keys) {
            const data = await redis.get(key);
            var msg = JSON.parse(data);
            if (msg.message_id == message_id) {
                if (returnFullMessage) return msg;
                else return msg.content;
            }
        }
        return null;
    } catch (error) {
        throw new Error(`[redis]获取消息失败: ${error}`);
    }
}

export async function removeSubKeys(parentKey: string, excludeKeys: string[] = []) {
    try {
        // 获取该群的所有消息 key
        const keys = await redis.keys(`${parentKey}:*`);
        // 排除指定key
        const keysToRemove = keys.filter((key: string) => !excludeKeys.includes(key));
        // 删除剩余的 key
        for (const key of keysToRemove) {
            await redis.del(key);
        }
    } catch (error) {
        throw new Error(`[redis]删除redis key失败: ${error}`);
    }
}

export const EMOTION_KEY = `juhkff:auto_reply:emotion`;
