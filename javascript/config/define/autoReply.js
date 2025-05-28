import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import lodash from "lodash";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";
import { removeSubKeys } from "../../utils/redis.js";
import { EMOTION_GENERATE, EVENT_UPDATE_EMOTION_GENERATE_TIME, EMOTION_KEY, EVENT_RELOAD_INSTANCE } from "../../model/constant.js";
import { deleteJob } from "../../utils/job.js";
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
        };
        func();
        return func;
    })();
    const afterUpdate = (previous) => {
        if (previous.chatApi != autoReplyConfig.chatApi) {
            autoReplyConfig.chatModel = "";
        }
        // 因为实现逻辑和结构体不同，所以切换时删除之前的redis存储
        if (previous.chatApiType.includes(ChatApiType.VISUAL) != autoReplyConfig.chatApiType.includes(ChatApiType.VISUAL)) {
            removeSubKeys("juhkff:auto_reply", [EMOTION_KEY]).then(() => { });
        }
        Bot.emit(EVENT_RELOAD_INSTANCE);
        if (autoReplyConfig.useAutoReply) {
            if (autoReplyConfig.useEmotion != previous.useEmotion || autoReplyConfig.useAutoReply != previous.useAutoReply || autoReplyConfig.emotionGenerateTime != previous.emotionGenerateTime) {
                Bot.emit(EVENT_UPDATE_EMOTION_GENERATE_TIME);
            }
        }
        else {
            deleteJob(EMOTION_GENERATE);
        }
    };
    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash)
            return;
        const previous = lodash.cloneDeep(autoReplyConfig);
        sync();
        afterUpdate(previous);
        lastHash = hash;
        logger.info(logger.grey(`[JUHKFF-PLUGIN]同步主动群聊配置`));
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]主动群聊同步配置异常`, err); });
})();
