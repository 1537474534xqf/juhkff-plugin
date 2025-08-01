import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import lodash from "lodash";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";

/**
 * 情景预设 dict 例:
 * {
 *  '#海龟汤':{
 *      prompt:["预设1","预设2"],
 *      timeout:120(秒),
 *      timeoutChat: "猜不出来？换一道吧"
 *  },
 *  '#成语接龙':{
 *      prompt:["预设1","预设2"],
 *      timeout:10(秒),
 *      timeoutChat: "你输了！"
 *  },
 * }
 */
export type CommandPrompt = {
    useCommandPrompt: boolean
    commandDict: {
        cmd: string,
        prompt: {
            text: string,
        }[],
        finishMsg: string,
        timeout: number,
        timeoutChat: string
    }[]
}
export const commandPromptConfig: CommandPrompt = {} as CommandPrompt;

(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `commandPrompt.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `commandPrompt.yaml`);
    if (configFolderCheck(file, defaultFile)) logger.info(`- [JUHKFF-PLUGIN] 创建情景预设配置`);

    let lastHash: string = getFileHash(fs.readFileSync(file, "utf8"));

    const sync = (() => {
        const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as CommandPrompt;
        const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8")) as CommandPrompt;
        configSync(userConfig, defaultConfig);
        privateSync(userConfig, defaultConfig);
        fs.writeFileSync(file, YAML.stringify(userConfig));
        Object.assign(commandPromptConfig, userConfig);
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as CommandPrompt;
            Object.assign(commandPromptConfig, userConfig);
        }
        return func;
    })();

    const afterUpdate = (previous: CommandPrompt) => { }

    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash) return;
        const previous = lodash.cloneDeep(commandPromptConfig);
        sync();
        afterUpdate(previous);
        lastHash = hash;
        logger.info(logger.grey(`- [JUHKFF-PLUGIN] 同步情景预设配置`));
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN] 情景预设配置同步异常`, err) })
})();

/**
 * 针对该功能的配置同步
 * @param userConfig 
 * @param defaultConfig 
 */
function privateSync(userConfig: CommandPrompt, defaultConfig: CommandPrompt) {
    let add = false;
    const cmd = [];
    for (const each of defaultConfig.commandDict) {
        if (userConfig.commandDict.find(e => e.cmd === each.cmd) !== undefined) {
            const index = userConfig.commandDict.findIndex(e => e.cmd === each.cmd);
            for (const property in each) {
                if (!userConfig.commandDict[index].hasOwnProperty(property)) {
                    userConfig.commandDict[index][property] = each[property];
                    add = true;
                    cmd.push(each.cmd);
                }
            }
        }
    }
    if (add) logger.info(logger.bgRgb(82, 70, 77).rgb(206, 139, 180).bold(`- [JUHKFF-PLUGIN] 情景预设更新：${cmd.join(", ")}`))
}