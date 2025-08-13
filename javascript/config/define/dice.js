import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import lodash from "lodash";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";
export const diceConfig = {};
(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `dice.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `dice.yaml`);
    if (configFolderCheck(file, defaultFile))
        logger.info(`- [JUHKFF-PLUGIN] 创建骰子配置`);
    let lastHash = getFileHash(fs.readFileSync(file, "utf8"));
    const sync = (() => {
        const userConfig = YAML.parse(fs.readFileSync(file, "utf8"));
        const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8"));
        configSync(userConfig, defaultConfig);
        fs.writeFileSync(file, YAML.stringify(userConfig));
        Object.assign(diceConfig, userConfig);
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8"));
            Object.assign(diceConfig, userConfig);
        };
        return func;
    })();
    const afterUpdate = (previous) => { };
    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash)
            return;
        const previous = lodash.cloneDeep(diceConfig);
        sync();
        afterUpdate(previous);
        lastHash = hash;
        logger.info(logger.grey(`- [JUHKFF-PLUGIN] 同步骰子配置`));
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN] 骰子配置同步异常`, err); });
})();
