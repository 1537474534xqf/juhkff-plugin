import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";
export const helpGenConfig = {};
(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `helpGen.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `helpGen.yaml`);
    if (configFolderCheck(file, defaultFile))
        logger.info(`[JUHKFF-PLUGIN]创建帮助生成配置`);
    let lastHash = getFileHash(fs.readFileSync(file, "utf8"));
    const sync = (() => {
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8"));
            const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8"));
            configSync(userConfig, defaultConfig);
            Object.assign(helpGenConfig, userConfig);
            fs.writeFileSync(file, YAML.stringify(helpGenConfig));
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
        logger.info(`[JUHKFF-PLUGIN]同步帮助生成配置`);
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]帮助生成同步配置异常`, err); });
})();
