import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../../model/path.js";
import { configFolderCheck, configSync } from "../../common.js";
export let douBaoConfig = null;
export function setDouBaoConfig(config) {
    douBaoConfig = config;
}
(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, "ai", `douBao.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, "ai", `douBao.yaml`);
    if (configFolderCheck(file, defaultFile))
        logger.info(`[JUHKFF-PLUGIN]创建豆包配置`);
    douBaoConfig = YAML.parse(fs.readFileSync(file, "utf8"));
    const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8"));
    configSync(douBaoConfig, defaultConfig);
    fs.writeFileSync(file, YAML.stringify(douBaoConfig));
    chokidar.watch(file).on("change", () => {
        douBaoConfig = YAML.parse(fs.readFileSync(file, "utf8"));
        logger.info(`[JUHKFF-PLUGIN]同步豆包配置`);
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]豆包同步配置异常`, err); });
})();
//# sourceMappingURL=douBao.js.map