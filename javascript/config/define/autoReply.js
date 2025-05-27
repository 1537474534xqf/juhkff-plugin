import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";
export var ChatApiType;
(function (ChatApiType) {
    ChatApiType["TEXT"] = "text";
    ChatApiType["VISUAL"] = "visual";
    ChatApiType["SOUND"] = "sound";
})(ChatApiType || (ChatApiType = {}));
export const autoReplyConfig = {};
(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `autoReply.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `autoReply.yaml`);
    if (configFolderCheck(file, defaultFile))
        logger.info(`[JUHKFF-PLUGIN]创建主动群聊配置`);
    let lastHash = getFileHash(fs.readFileSync(file, "utf8"));
    const sync = (() => {
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8"));
            const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8"));
            // 对预设单独处理，将旧预设自动更新为新预设
            if (defaultConfig.oldPrompt.includes(userConfig.chatPrompt.trim()))
                userConfig.chatPrompt = defaultConfig.chatPrompt;
            delete defaultConfig.oldPrompt;
            configSync(userConfig, defaultConfig);
            Object.assign(autoReplyConfig, userConfig);
            fs.writeFileSync(file, YAML.stringify(autoReplyConfig));
        };
        func();
        return func;
    })();
    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash)
            return;
        sync();
        lastHash = hash;
        logger.info(`[JUHKFF-PLUGIN]同步主动群聊配置`);
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]主动群聊同步配置异常`, err); });
})();
