import path from "path";
import fs from "fs";
import { get, getXML } from "../utils/net.js";
import { formatDate, getFestivalsDates } from "../utils/date.js";
import { generateDailyReport } from "../utils/page.js";
import { config } from "../config/index.js";
import { Objects } from "../utils/kits.js";
import { PLUGIN_DATA_DIR } from "../model/path.js";
export const help = () => {
    return {
        name: "日报",
        type: "passive",
        command: "#日报",
        dsc: "主动或定时推送日报",
        enable: config.dailyReport.useDailyReport,
    };
};
export class dailyReport extends plugin {
    constructor() {
        super({
            name: "[扎克芙芙]推送日报",
            dsc: "推送日报",
            event: "message",
            priority: 1,
            rule: [
                {
                    reg: "^#日报$",
                    fnc: "dailyReport",
                },
            ],
        });
    }
    static hitokoto_url = "https://v1.hitokoto.cn/?c=a";
    static alapi_url = "https://v2.alapi.cn/api/zaobao";
    static six_url = "https://60s-api.viki.moe/v2/60s";
    // private static game_url = "https://www.4gamers.com.tw/rss/latest-news";
    static bili_url = "https://s.search.bilibili.com/main/hotword";
    static it_url = "https://www.ithome.com/rss/";
    static anime_url = "https://api.bgm.tv/calendar";
    static week = {
        0: "日",
        1: "一",
        2: "二",
        3: "三",
        4: "四",
        5: "五",
        6: "六",
    };
    static getCurrentWeekDay() {
        const today = new Date();
        const dayIndex = today.getDay();
        return `星期${dailyReport.week[dayIndex]}`;
    }
    static async generateDailyReport() {
        const hitokotoResp = await get(dailyReport.hitokoto_url);
        const hitokoto = hitokotoResp.hitokoto;
        var sixResp, six;
        var biliResp = await get(dailyReport.bili_url);
        var bili = [];
        var itResp = await getXML(dailyReport.it_url);
        var it = [];
        var animeResp = await get(dailyReport.anime_url);
        var anime = [];
        if (!Objects.isNull(config.dailyReport.alapiToken)) {
            // 使用 alapitoken 获取数据
            let alapi = await get(`${dailyReport.alapi_url}?token=${config.dailyReport.alapiToken}`);
            let news = alapi.data.news;
            // 删掉、
            news.forEach((item, index) => {
                var find = news[index].indexOf('、');
                if (find !== -1) {
                    news[index] = item.substring(find + 1, item.length);
                }
                // 删除句子最后的标点
                if (news[index].endsWith('。') || news[index].endsWith('！') || news[index].endsWith('；') || news[index].endsWith('？')) {
                    news[index] = news[index].substring(0, news[index].length - 1);
                }
            });
            six = news;
            if (six.length > 11) {
                six = six.slice(0, 11);
            }
        }
        else {
            sixResp = await get(dailyReport.six_url);
            six = sixResp.data.news;
            if (six.length > 11) {
                six = six.slice(0, 11);
            }
        }
        for (var each in biliResp.list) {
            if (biliResp.list.hasOwnProperty(each)) {
                bili.push({
                    keyword: biliResp.list[each].keyword,
                    icon: biliResp.list[each].icon,
                });
            }
        }
        // 获取所有 <item> 元素
        var items = itResp.getElementsByTagName("item");
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var title = item.getElementsByTagName("title")[0]?.textContent || "无标题";
            it.push(title);
            if (it.length >= 11)
                break;
        }
        const currentDay = dailyReport.getCurrentWeekDay(); // 获取当前星期几
        for (var day of animeResp) {
            if (day.weekday.cn === currentDay) {
                var i = 0;
                for (var eachItem of day.items) {
                    if (eachItem.name_cn) {
                        anime.push({
                            name: eachItem.name_cn,
                            image: eachItem.images.large ? eachItem.images.large : eachItem.images.common,
                        });
                    }
                    else {
                        anime.push({
                            name: eachItem.name,
                            image: eachItem.images.large ? eachItem.images.large : eachItem.images.common,
                        });
                    }
                    i++;
                    if (i >= 8)
                        break;
                }
                break;
            }
        }
        var data = {
            data_hitokoto: hitokoto,
            data_six: six,
            data_bili: bili,
            data_it: it,
            data_anime: anime,
            week: dailyReport.week[new Date().getDay()],
            date: await formatDate(Date.now()),
            zh_date: await formatDate(Date.now(), "zh"),
            full_show: config.dailyReport.dailyReportFullShow,
            data_festival: await getFestivalsDates(),
        };
        // 生成图片
        var image = await generateDailyReport(data);
        var imageBuffer = Buffer.from(image);
        return imageBuffer;
    }
    static async generateAndSaveDailyReport() {
        const imageBuffer = await dailyReport.generateDailyReport();
        if (!fs.existsSync(path.dirname(DAILY_REPORT_SAVE_PATH)))
            fs.mkdirSync(path.dirname(DAILY_REPORT_SAVE_PATH));
        fs.writeFileSync(DAILY_REPORT_SAVE_PATH, imageBuffer);
    }
    async dailyReport(e) {
        if (!config.dailyReport.useDailyReport)
            return false;
        if (e.message_type != "group") {
            await e.reply("功能只对群聊开放");
            return true;
        }
        if (config.dailyReport.preHandle) {
            if (!fs.existsSync(DAILY_REPORT_SAVE_PATH)) {
                dailyReport.generateAndSaveDailyReport();
            }
            const imageBuffer = fs.readFileSync(DAILY_REPORT_SAVE_PATH);
            if (imageBuffer) {
                await e.reply([segment.image(imageBuffer)]);
            }
        }
        else {
            const imageBuffer = await dailyReport.generateDailyReport();
            if (imageBuffer) {
                await e.reply([segment.image(imageBuffer)]);
            }
        }
        return true;
    }
}
export const DAILY_REPORT_SAVE_PATH = path.join(PLUGIN_DATA_DIR, "dailyReport", "dailyReport.png");
//# sourceMappingURL=dailyReport.js.map