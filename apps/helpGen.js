import setting from "#juhkff.setting";
import { pluginResources, pluginRoot } from "#juhkff.path";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";
import { renderPage } from "../utils/page.js"

export class helpGen extends plugin {
    constructor() {
        super({
            name: "帮助",
            dsc: "帮助",
            event: "message",
            priority: 1000,
            rule: [
                {
                    reg: `^#${setting.getConfig("helpGen").command}$`,
                    fnc: "helpGenerate",
                }
            ],
        });
        this.extraHelp = initExtraHelp();
    }

    get Config() {
        return setting.getConfig("helpGen");
    }

    async helpGenerate(e) {
        if (!this.Config.useHelpGen) return false;
        // 获取apps目录下的所有插件
        const pluginDir = path.join(pluginRoot, "apps");
        var helpList = []
        await this.loadPluginHelp(pluginDir, helpList, /*[`${path.join(pluginDir, "helpGen.js")}`]*/);
        if (!this.Config.hd) {
            // 使用内置的渲染器，此时会自行回复，不需要e.reply
            if (!e.runtime) {
                await e.reply('目前版本不支持，请升级至最新版Yunzai，或尝试切换hd模式')
            }
            return e.runtime.render("juhkff-plugin", "help/index", {
                // cssFile: "../../../../../plugins/juhkff-plugin/resources/help/index.css",
                // 用绝对路径似乎也没问题，调试时将Yunzai/temp/html/juhkff-plugin/help/index/index.html中的css导入路径改为相对路径
                cssFile: path.join(pluginResources, "help", "index.css"),
                quality: 100,   // 还是好糊啊啊啊
                titleZh: this.Config.command,
                titleEn: "JUHKFF-PLUGIN",
                helpGroup: helpList.filter((item) => item?.type === "group" && item?.enable),
                helpActive: helpList.filter((item) => item?.type === "active" && item?.enable),
                helpPassive: helpList.filter((item) => item?.type === "passive" && item?.enable),
            })
        } else {
            // 自行实现的渲染器，分辨率较高，出图慢
            // TODO 考虑像内置的渲染器一样实现下生命周期
            var buffer = await renderPage(path.join(pluginResources, "help", "index.html"),
                {
                    titleZh: this.Config.command,
                    titleEn: "JUHKFF-PLUGIN",
                    helpGroup: helpList.filter((item) => item?.type === "group" && item?.enable),
                    helpActive: helpList.filter((item) => item?.type === "active" && item?.enable),
                    helpPassive: helpList.filter((item) => item?.type === "passive" && item?.enable),
                }
            )
            await e.reply(segment.image(buffer));
        }
    }

    async loadPluginHelp(dir, helpList, extract = []) {
        var files = fs.readdirSync(dir);
        for (var file of files) {
            var filePath = path.join(dir, file);
            if (extract.includes(filePath)) continue;
            if (fs.statSync(filePath).isDirectory()) {
                await this.loadPluginHelp(filePath, helpList, extract);
            } else if (isAppFile(filePath)) {
                var fileName = path.basename(filePath, ".js");
                filePath = pathToFileURL(filePath).href;
                var plugin = await import(filePath)
                if (!plugin.help) {
                    if (this.extraHelp.hasOwnProperty(fileName)) {
                        if (this.extraHelp[fileName] instanceof Function)
                            helpList.push(this.extraHelp[fileName]());
                        else
                            helpList.push(this.extraHelp[fileName]);
                    } else {
                        logger.warn(`[JUHKFF-PLUGIN] 插件 ${fileName} 未获取到帮助提示项`);
                    }
                } else {
                    helpList.push(plugin.help);
                }
            }
        }
    }
}

function initExtraHelp() {
    let extraHelp = {};
    extraHelp["douBao"] = douBaoHelp;
    extraHelp["helpGen"] = helpDesc;
    return extraHelp;
}

function isAppFile(filePath) {
    const extname = path.extname(filePath);
    return extname === ".js";
}

/* --------------------------------------------------------单独导入-------------------------------------------------------- */

// 自己不能生成自己，要写在这里
var helpDesc = {
    name: "帮助",
    type: "active",
    command: `#${setting.getConfig("helpGen").command}`,
    dsc: "生成帮助图片",
    enable: setting.getConfig("helpGen").useHelpGen,
}

// 配置过长的插件单独导入插件帮助
var douBaoHelp = () => {
    var config = setting.getConfig("douBao");
    return {
        name: "豆包",
        type: "group",
        dsc: "接入豆包",
        enable: config.useDouBao,
        subMenu: [
            {
                name: "视频生成",
                type: "active",
                command: "#视频生成 文本|图片 [宽高比] [5|10](视频秒数)",
                enable: config.useVideoGenerate,
            },
            {
                name: "图片生成",
                type: "active",
                command: "#图片生成 文本 图片1|图片...(同宽高) [-w 宽] [-h 高]",
                enable: config.useImageGenerate,
            },
            {
                name: "图片模仿",
                command: "#图片模仿 文本 图片",
                enable: config.useImageImitate,
            },
            {
                name: "图片风格化",
                command: "#图片风格化 类型前缀 图片",
                enable: config.useImageStyle,
            },
            {
                name: "图片风格化",
                command: "#图片风格化 类型列表",
                enable: config.useImageStyle,
            }
        ]
    }
}
