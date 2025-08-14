import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";

export type Kits = {
    useShareAnalyse: boolean,
}

export const kitsConfig: Kits = {} as Kits;

(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `kits.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `kits.yaml`);
    if (configFolderCheck(file, defaultFile)) logger.info(`- [JUHKFF-PLUGIN] 创建Kits配置`);

    let lastHash: string = getFileHash(fs.readFileSync(file, "utf8"));

    const sync = (() => {
        const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as Kits;
        const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8")) as Kits;
        configSync(userConfig, defaultConfig);
        fs.writeFileSync(file, YAML.stringify(userConfig));
        Object.assign(kitsConfig, userConfig);
        const func = async () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as Kits;
            Object.assign(kitsConfig, userConfig);
            // 插件初始化逻辑，插件启动不需要await，直接调用即可
        }
        func();
        return func;
    })();

    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash) return;
        sync();
        lastHash = hash;
        logger.info(logger.grey(`- [JUHKFF-PLUGIN] 同步Kits配置`));
    }).on("error", (err) => { logger.error(`- [JUHKFF-PLUGIN] Kits配置同步异常`, err) })
})();