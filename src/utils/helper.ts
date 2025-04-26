/**
 * @file helper.js
 * @description: 原始数据调用第三方处理相关
 */

import setting from "../model/setting";
import { VisualInterface, visualMap } from "../model/visual";
import { url2Base64 } from "./net";

function getConfig() {
    return setting.getConfig("autoReply");
}

/**
 * 从URL提取内容
 * @param url 需要提取内容的URL
 * @returns 解析的内容
 */
export async function extractUrlContent(url: string): Promise<JSON> {
    try {
        logger.info(`[URL提取]开始从URL获取内容: ${url}`);
        const response = await fetch(
            `https://lbl.news/api/extract?url=${encodeURIComponent(url)}`
        );
        if (!response.ok) {
            throw new Error(`提取内容失败: ${response.statusText}`);
        }
        const data = await response.json();
        logger.info(`[URL提取]成功获取URL内容: ${url}`);
        return data;
    } catch (error) {
        throw new Error(`[URL提取]提取内容失败: ${error}`);
    }
}

export async function analyseImage(image: string, input: any) {
    var config = getConfig();
    var visualApi = config.visualApi;
    var visualApiKey = config.visualApiKey;
    var model = config.visualModel;
    if (!image.startsWith("data:")) {
        image = await url2Base64(image) as string;
    }
    var visualInstance = visualMap[visualApi];
    if (!visualInstance) {
        return "[autoReply]请在autoReply.yaml中设置有效的视觉AI接口";
    }
    var result = await visualInstance[VisualInterface.toolRequest]({
        apiKey: visualApiKey,
        model: model,
        j_msg: { img: [image], text: [input] },
    });
    return result;
}
