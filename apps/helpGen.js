import setting from "#juhkff.setting";
import { pluginResources, pluginRoot } from "#juhkff.path";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";

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
                    fnc: "help",
                }
            ],
        });
        initExtraHelp();
    }

    get Config() {
        return setting.getConfig("helpGen");
    }

    async help(e) {
        // 获取apps目录下的所有插件
        const pluginDir = path.join(pluginRoot, "apps");
        var helpList = []
        await loadPluginHelp(pluginDir, helpList, [`${path.join(pluginDir, "helpGen.js")}`]);
        if (!e.runtime) {
            console.log('未找到e.runtime，请升级至最新版Yunzai')
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
        }, {
            beforeRender({ data }) {
                //目前不需要添加什么逻辑
            }
        })
    }
}

var extraHelp = {}

function initExtraHelp() {
    extraHelp["douBao"] = douBaoHelp;
}

async function loadPluginHelp(dir, helpList, extract = []) {
    var files = fs.readdirSync(dir);
    for (var file of files) {
        var filePath = path.join(dir, file);
        if (extract.includes(filePath)) continue;
        if (fs.statSync(filePath).isDirectory()) {
            await loadPluginHelp(filePath, helpList);
        } else if (isAppFile(filePath)) {
            var fileName = path.basename(filePath, ".js");
            filePath = pathToFileURL(filePath).href;
            var plugin = await import(filePath)
            if (!plugin.help) {
                if (extraHelp.hasOwnProperty(fileName)) {
                    if (extraHelp[fileName] instanceof Function)
                        helpList.push(extraHelp[fileName]());
                    else
                        helpList.push(extraHelp[fileName]);
                } else {
                    logger.warn(`[JUHKFF-PLUGIN] 插件 ${fileName} 未获取到帮助提示项`);
                }
            } else {
                helpList.push(plugin.help);
            }
        }
    }
}

function isAppFile(filePath) {
    const extname = path.extname(filePath);
    return extname === ".js";
}

/* --------------------------------------------------------单独导入-------------------------------------------------------- */

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
                dsc: "视频生成描述",
                enable: config.useVideoGenerate,
            },
            {
                name: "图片生成",
                type: "active",
                command: "#图片生成 文本 图片1|图片...(同宽高) [-w 宽] [-h 高]",
                dsc: "图片生成描述",
                enable: config.useImageGenerate,
            },
            {
                name: "图片模仿",
                command: "#图片模仿 文本 图片",
                dsc: "图片模仿描述",
                enable: config.useImageImitate,
            },
            {
                name: "图片风格化",
                command: "#图片风格化 类型前缀 图片",
                dsc: "图片风格化描述",
                enable: config.useImageStyle,
            },
            {
                name: "图片风格化",
                command: "#图片风格化 类型列表",
                dsc: "图片风格化描述",
                enable: config.useImageStyle,
            }
        ]
    }
}
