import axios from "axios";
import { config } from "../config/index.js";
export const help = () => {
    return {
        name: "分享内容解析",
        type: "passive",
        dsc: "PC端用户无法直接看到分享内容时，可以看BOT发送的解析简单了解",
        enable: config.kits.useShareAnalyse,
    };
};
export class shareAnalyse extends plugin {
    constructor() {
        super({
            name: "[扎克芙芙]分享链接内容解析",
            dsc: "分析链接内容，PC端用户无法直接看到分享内容时，可以看BOT发送的解析简单了解",
            event: "message",
            priority: 5000, // 优先级，越小越先执行
            rule: [
                {
                    reg: ".*",
                    fnc: "analyseShare",
                    log: false,
                },
            ],
        });
    }
    async analyseShare(e) {
        if (!config.kits.useShareAnalyse)
            return false;
        if (this.isShareInfo(e)) {
            const result = await this.analyseShareLinkContent(e, e.message[0].data);
            if (result)
                await e.reply(result);
        }
        return false;
    }
    isShareInfo(e) {
        let conditions = e.message.length === 1;
        conditions &&= e.message[0].type === 'json';
        return conditions;
    }
    async analyseShareLinkContent(e, data) {
        const json = JSON.parse(data);
        if (this.isFromHeyBox(json)) {
            // 小黑盒分享处理
            const news = json.meta.news;
            const from = news.tag;
            const url = news.jumpUrl;
            const preview = news.preview;
            const title = news.title;
            const desc = news.desc;
            const replyContent = [
                preview ? segment.image(preview) : null,
                url ? url + "\n" : null,
                from ? `来自${from}的分享——` : null,
                title ? `《${title}》：` : null,
                desc ? desc : null
            ];
            return replyContent;
        }
        if (this.isFromBilibili(json)) {
            // QQ小程序分享处理
            const detail_1 = json.meta.detail_1;
            const from = detail_1.title;
            // const icon = detail_1.icon;
            const url = detail_1.qqdocurl;
            // 获取BV号
            const realUrl = await this.extractBVId(url);
            const requestUrl = "https://bibz.me/api/cover-extractor";
            const previews = (await axios.post(requestUrl, { inputValue: realUrl })).data.coverFormats;
            const preview = previews[previews.length / 2].url;
            const title = detail_1.desc;
            const replyContent = [
                preview ? segment.image(preview) : null,
                url ? url + "\n" : null,
                from ? `来自${from}的分享——` : null,
                title ? `${title}` : null,
            ];
            return replyContent;
        }
        return null;
    }
    isFromHeyBox(json) {
        return json?.meta?.news?.tag === "小黑盒";
    }
    isFromBilibili(json) {
        return json?.meta?.detail_1?.title === "哔哩哔哩";
    }
    /**
     * 从B站链接中提取BV号
     * @param message 包含B站链接的文本
     * @returns BV号或null
     */
    async extractBVId(url) {
        const b23Id = this.extractB23TVId(url);
        const requestUrl = "https://apiv2.magecorn.com/bilicover/get";
        const realUrl = (await axios.get(requestUrl, {
            params: {
                type: 'b23',
                id: b23Id
            }
        })).data.result;
        return realUrl;
    }
    /**
     * 从b23.tv短链接中提取ID
     * @param message 包含b23.tv短链接的文本
     * @returns 短链接ID或null
     */
    extractB23TVId(b23Url) {
        // 正则表达式匹配b23.tv短链接中的ID部分
        const b23Regex = /b23\.tv\/([a-zA-Z0-9]+)/;
        const match = b23Url.match(b23Regex);
        return match[1];
    }
}
