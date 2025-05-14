/**
 * 处理消息
 * @param {*} msgList
 * @returns result {texts: "", images: [], content: []}
 * texts: 文本部分
 * images: 图片部分
 * content: 按顺序排列的消息体
 */
export async function processMessage(e) {
    var result = { texts: "", images: [], content: [] };
    var msgList = e.message;
    var texts = [];
    for (var i = 0; i < msgList.length; i++) {
        var msg = msgList[i];
        if (msg.type == "text") {
            result.content.push({
                type: "text",
                text: msg.text.replace(/\s+/g, " ").trim(),
            });
            texts.push(msg.text);
        }
        else if (msg.type == "image") {
            result.content.push({ type: "image", url: msg.url });
            result.images.push(msg.url);
        }
        else if (msg.type == "reply") {
            var sourceImages = await e.getReply(msg.id);
            sourceImages = sourceImages?.message.filter((each) => {
                return each.type == "image";
            });
            sourceImages.forEach((each) => {
                result.content.push({ type: "image", url: each.url });
                result.images.push(each.url);
            });
        }
        else if (msg.type != "at") {
            //其它类型，保持原样加进result，虽然不知道有什么用
            result.content.push(msg);
        }
    }
    var textPart = texts.join(" ");
    // 将空格固定为一个
    textPart = textPart.replace(/\s+/g, " ");
    result.texts = textPart.trim();
    return result;
}
// 定义 sleep 函数，用于异步延迟
export const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
