import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import lodash from "lodash";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";
export const commandPromptConfig = {};
(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `commandPrompt.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `commandPrompt.yaml`);
    if (configFolderCheck(file, defaultFile))
        logger.info(`[JUHKFF-PLUGIN]创建情景预设配置`);
    let lastHash = getFileHash(fs.readFileSync(file, "utf8"));
    const sync = (() => {
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8"));
            const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8"));
            configSync(userConfig, defaultConfig);
            Object.assign(commandPromptConfig, userConfig);
        };
        func();
        return func;
    })();
    const afterUpdate = (previous) => { };
    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash)
            return;
        const previous = lodash.cloneDeep(commandPromptConfig);
        sync();
        afterUpdate(previous);
        lastHash = hash;
        logger.info(logger.grey(`[JUHKFF-PLUGIN]同步情景预设配置`));
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]情景预设配置同步异常`, err); });
})();
//# sourceMappingURL=commandPrompt.js.map