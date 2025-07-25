import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../../common.js";
export const douBaoConfig = {};
(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, "ai", `douBao.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, "ai", `douBao.yaml`);
    if (configFolderCheck(file, defaultFile))
        logger.info(`- [JUHKFF-PLUGIN] 创建豆包配置`);
    const sync = (() => {
        const userConfig = YAML.parse(fs.readFileSync(file, "utf8"));
        const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8"));
        configSync(userConfig, defaultConfig);
        fs.writeFileSync(file, YAML.stringify(userConfig));
        Object.assign(douBaoConfig, userConfig);
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8"));
            Object.assign(douBaoConfig, userConfig);
        };
        func();
        return func;
    })();
    let lastHash = getFileHash(fs.readFileSync(file, "utf8"));
    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash)
            return;
        sync();
        lastHash = hash;
        logger.info(logger.grey(`- [JUHKFF-PLUGIN] 同步豆包配置`));
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN] 豆包配置同步异常`, err); });
})();
