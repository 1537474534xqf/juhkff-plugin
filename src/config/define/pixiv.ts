import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";

export type Pixiv = {
    usePixiv: boolean,
    subscribeUserId: string[], // 订阅用户ID
    subscribeInterval: number, // 订阅查询频率（分）
}

export const pixivConfig: Pixiv = {} as Pixiv;

(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `pixiv.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `pixiv.yaml`);
    if (configFolderCheck(file, defaultFile)) logger.info(`- [JUHKFF-PLUGIN] 创建Pixiv配置`);

    let lastHash: string = getFileHash(fs.readFileSync(file, "utf8"));

    const sync = (() => {
        const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as Pixiv;
        const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8")) as Pixiv;
        configSync(userConfig, defaultConfig);
        fs.writeFileSync(file, YAML.stringify(userConfig));
        Object.assign(pixivConfig, userConfig);
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as Pixiv;
            Object.assign(pixivConfig, userConfig);
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
        logger.info(logger.grey(`- [JUHKFF-PLUGIN] 同步Pixiv配置`));
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN] Pixiv配置同步异常`, err) })
})();


// 添加订阅用户ID
export function addSubscribeUserId(userId: string) {
    if (!pixivConfig.subscribeUserId.includes(userId)) {
        pixivConfig.subscribeUserId.push(userId);
        const file = path.join(PLUGIN_CONFIG_DIR, `pixiv.yaml`);
        fs.writeFileSync(file, YAML.stringify(pixivConfig));
    }
}