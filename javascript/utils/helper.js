/**
 * @file helper.js
 * @description: 原始数据调用第三方处理相关
 */
import { autoReplyConfig } from "../config/define/autoReply.js";
import { visualInstance } from "../model/map.js";
import { url2Base64 } from "./net.js";
/**
 * 从URL提取内容
 * @param url 需要提取内容的URL
 * @returns 解析的内容
 */
export async function extractUrlContent(url) {
    try {
        logger.info(`[URL提取]开始从URL获取内容: ${url}`);
        const response = await fetch(`https://lbl.news/api/extract?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
            throw new Error(`提取内容失败: ${response.statusText}`);
        }
        const data = await response.json();
        logger.info(`[URL提取]成功获取URL内容: ${url}`);
        return data;
    }
    catch (error) {
        throw new Error(`[URL提取]提取内容失败: ${error}`);
    }
}
export async function analyseImage(image, input) {
    var model = autoReplyConfig.visualModel;
    if (!image.startsWith("data:")) {
        image = await url2Base64(image);
    }
    if (!visualInstance) {
        return "[helper]请设置有效的视觉AI接口";
    }
    var result = await visualInstance.toolRequest(model, { img: [image], text: [input] });
    return result;
}
//# sourceMappingURL=helper.js.map