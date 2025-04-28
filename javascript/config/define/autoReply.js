import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync } from "../common.js";
export let autoReplyConfig = null;
(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `autoReply.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `autoReply.yaml`);
    if (configFolderCheck(file, defaultFile))
        logger.info(`[JUHKFF-PLUGIN]创建主动群聊配置`);
    autoReplyConfig = YAML.parse(fs.readFileSync(file, "utf8"));
    const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8"));
    // 对预设单独处理，将旧预设自动更新为新预设
    if (defaultConfig.oldPrompt.includes(autoReplyConfig.chatPrompt.trim()))
        autoReplyConfig.chatPrompt = defaultConfig.chatPrompt;
    delete defaultConfig.oldPrompt;
    configSync(autoReplyConfig, defaultConfig);
    fs.writeFileSync(file, YAML.stringify(autoReplyConfig));
    chokidar.watch(file).on("change", () => {
        autoReplyConfig = YAML.parse(fs.readFileSync(file, "utf8"));
        logger.info(`[JUHKFF-PLUGIN]同步主动群聊配置`);
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]主动群聊同步配置异常`, err); });
})();
//# sourceMappingURL=autoReply.js.map