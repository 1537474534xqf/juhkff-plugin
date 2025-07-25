import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";
import { renderPage } from "../utils/page.js"
import { PLUGIN_APP_DIR, PLUGIN_RESOURCES_DIR } from "../model/path.js";
import { Objects, StringUtils } from "../utils/kits.js";
import { config } from "../config/index.js";
import { HelpType } from "../types.js";

export class helpGen extends plugin {
    extraHelp: Record<string, HelpType | (() => HelpType)>;
    constructor() {
        super({
            name: "帮助",
            dsc: "帮助",
            event: "message",
            priority: 1,
            rule: [
                {
                    reg: `^#${config.helpGen.command}$`,
                    fnc: "helpGenerate",
                }
            ],
        });
        this.extraHelp = initExtraHelp();
    }

    async helpGenerate(e: any) {
        if (!config.helpGen.useHelpGen) return false;
        var helpList: HelpType[] = []
        await this.loadPluginHelp(PLUGIN_APP_DIR, helpList, /*[`${path.join(pluginDir, "helpGen.js")}`]*/);
        this.addManualHelp(helpList);
        if (!config.helpGen.hd) {
            // 使用内置的渲染器，此时会自行回复，不需要e.reply
            if (!e.runtime) {
                await e.reply('目前版本不支持，请升级至最新版Yunzai，或尝试切换hd模式')
                return true;
            }
            e.runtime.render("juhkff-plugin", "help/index", {
                // cssFile: "../../../../../plugins/juhkff-plugin/resources/help/index.css",
                // 用绝对路径似乎也没问题，调试时将Yunzai/temp/html/juhkff-plugin/help/index/index.html中的css导入路径改为相对路径
                cssFile: path.join(PLUGIN_RESOURCES_DIR, "help", "index.css"),
                quality: 100,   // 还是好糊啊啊啊
                titleZh: Objects.isNull(config.helpGen?.titleZh) ? config.helpGen.command : config.helpGen?.titleZh,
                titleEn: Objects.isNull(config.helpGen?.titleEn) ? "JUHKFF-PLUGIN" : config.helpGen?.titleEn,
                helpGroup: helpList.filter((item) => item?.type === "group" && item?.enable),
                helpActive: helpList.filter((item) => item?.type === "active" && item?.enable),
                helpPassive: helpList.filter((item) => item?.type === "passive" && item?.enable),
                colorOptions: config.helpGen.colorOptions,
            })
        } else {
            // 自行实现的渲染器，分辨率较高，出图慢
            // TODO 考虑像内置的渲染器一样实现下生命周期
            var buffer = await renderPage(path.join(PLUGIN_RESOURCES_DIR, "help", "index.html"),
                {
                    cssFile: "index.css",
                    titleZh: Objects.isNull(config.helpGen?.titleZh) ? config.helpGen.command : config.helpGen?.titleZh,
                    titleEn: Objects.isNull(config.helpGen?.titleEn) ? "JUHKFF-PLUGIN" : config.helpGen?.titleEn,
                    helpGroup: helpList.filter((item) => item?.type === "group" && item?.enable),
                    helpActive: helpList.filter((item) => item?.type === "active" && item?.enable),
                    helpPassive: helpList.filter((item) => item?.type === "passive" && item?.enable),
                    colorOptions: config.helpGen.colorOptions,
                }
            )
            await e.reply(segment.image(buffer));
        }
        return true;
    }

    /**
     * 扫描dir目录下的所有export help的插件，获取help内容，并加入helpList，extract为排除列表
     * @param {*} dir 扫描的根目录
     * @param {*} helpList 最终的帮助列表，一般入口处传入空数组对象即可
     * @param {*} extract 排除列表，每一项为绝对路径
     */
    async loadPluginHelp(dir: string, helpList: HelpType[], extract: string[] = []) {
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
                        if (this.extraHelp[fileName] instanceof Function) {
                            if (!((this.extraHelp[fileName] as () => HelpType)()).hasOwnProperty("subMenu") || (this.extraHelp[fileName] as () => HelpType)().subMenu.length > 0)
                                helpList.push((this.extraHelp[fileName] as Function)());
                        } else {
                            if (!(this.extraHelp[fileName] as HelpType).hasOwnProperty("subMenu") || (this.extraHelp[fileName] as HelpType).subMenu.length > 0)
                                helpList.push((this.extraHelp[fileName] as HelpType));
                        }
                    } else {
                        logger.warn(`[JUHKFF-PLUGIN] 插件 ${fileName} 未获取到帮助提示项`);
                    }
                } else if (plugin.help instanceof Function) {
                    helpList.push(plugin.help());
                } else if (plugin.help instanceof Object) {
                    // 如果不使用方法，插件开关应统一格式为use+插件文件名
                    plugin.help.enable = fileName[`use${StringUtils.toUpperFirst(fileName)}`];
                    helpList.push(plugin.help);
                }
            }
        }
    }

    addManualHelp(helpList: HelpType[]) {
        var manualHelpList = config.helpGen.manualList;
        if (Objects.isNull(manualHelpList)) return;
        var groupHelpList = manualHelpList.filter((item) => item?.type === "group");
        var subHelpList = manualHelpList.filter((item) => item?.type === "sub");
        var otherHelpList = manualHelpList.filter((item) => item?.type !== "group" && item?.type !== "sub");
        groupHelpList.forEach((group) => {
            helpList.push({
                name: group?.name,
                type: "group",
                command: group?.command,
                dsc: group?.dsc,
                enable: true,
                subMenu: subHelpList.filter((item) => item?.belongTo === group.name).map((item) => {
                    return {
                        name: item?.name,
                        type: "sub",
                        command: item?.command,
                        dsc: item?.dsc,
                        enable: true,
                    }
                })
            });
        });
        otherHelpList.forEach((help) => {
            helpList.push({
                name: help?.name,
                type: help?.type,
                command: help?.command,
                dsc: help?.dsc,
                enable: true,
            });
        });
    }
}



function initExtraHelp() {
    let extraHelp: Record<string, HelpType | (() => HelpType)> = {};
    extraHelp["douBao"] = douBaoHelp;
    extraHelp["helpGen"] = helpDesc;
    extraHelp["commandPrompt"] = commandPromptHelp;
    return extraHelp;
}

function isAppFile(filePath: string) {
    const extname = path.extname(filePath);
    return extname === ".js";
}

/* --------------------------------------------------------单独导入-------------------------------------------------------- */

// 自己不能生成自己，要写在这里
var helpDesc = (): HelpType => {
    return {
        name: "帮助",
        type: "active",
        command: `#${config.helpGen.command}`,
        dsc: "生成帮助图片",
        enable: config.helpGen.useHelpGen,
    }
}

// 配置过长的插件单独导入插件帮助
var douBaoHelp = (): HelpType => {
    return {
        name: "豆包",
        type: "group",
        dsc: "使用 `#豆包` 查看详细子命令列表",
        enable: config.douBao.useDouBao,
        subMenu: [
            {
                name: "视频生成",
                type: "sub",
                command: "#视频生成[豆包] 文本|图片",
                enable: config.douBao.useVideoGenerate,
            },
            {
                name: "图片生成",
                type: "sub",
                command: "#图片生成[豆包] 文本",
                enable: config.douBao.useImageGenerate,
            },
            {
                name: "图片模仿",
                type: "sub",
                command: "#图片模仿[豆包] 文本 图片",
                enable: config.douBao.useImageImitate,
            },
            {
                name: "图片风格化",
                type: "sub",
                command: "#图片风格化[豆包] 类型前缀 图片",
                enable: config.douBao.useImageStyle,
            },
            {
                name: "图片风格化",
                type: "sub",
                command: "#图片风格化[豆包] 类型列表",
                enable: config.douBao.useImageStyle,
            },
            {
                name: "歌曲生成",
                type: "sub",
                command: "#歌曲生成[豆包] -p提示文本 [...]",
                enable: config.douBao.useSongGenerate,
            },
            {
                name: "纯音乐生成",
                type: "sub",
                command: "#BGM生成[豆包] -p提示文本 [...]",
                enable: config.douBao.useBgmGenerate,
            }
        ]
    }
}

var commandPromptHelp = (): HelpType => {
    return {
        name: "命令预设",
        type: "group",
        dsc: "进入预设情景，群BOT回复一切聊天内容，除非触发关键词或输入 `#结束`",
        enable: config.commandPrompt.useCommandPrompt,
        subMenu: Object.values(config.commandPrompt.commandDict).map((item) => ({
            name: `#${item.cmd}`,
            type: "sub",
            enable: config.commandPrompt.useCommandPrompt
        })),
    }
}
