import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { configFolderCheck, configSync, getFileHash } from "../../common.js";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../../model/path.js";

export type SiliconFlow = {
    useSF: boolean
    sfApiKey: string
    useVideoGenerate: boolean
    videoGenerateUrl: string
    videoGenerateRequestUrl: string
    videoGenerateModel: string
    useVoiceGenerate: boolean
    chatTransVoiceResponse: boolean
    chatTransVoiceRate: number
    voiceGenerateUrl: string
    voiceGenerateModel: string
    voiceGenerateCharacter: string
}

export const sfConfig: SiliconFlow = {} as SiliconFlow;

(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, "ai", `siliconflow.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, "ai", `siliconflow.yaml`);
    if (configFolderCheck(file, defaultFile)) logger.info(`[JUHKFF-PLUGIN]创建SiliconFlow配置`);

    let lastHash: string = getFileHash(fs.readFileSync(file, "utf8"));

    const sync = (() => {
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as SiliconFlow;
            const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8")) as SiliconFlow;
            configSync(userConfig, defaultConfig);
            Object.assign(sfConfig, userConfig);
        }
        func();
        return func;
    })()

    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash) return;
        sync();
        lastHash = hash;
        logger.info(logger.grey(`[JUHKFF-PLUGIN]同步SiliconFlow配置`));
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]SiliconFlow同步配置异常`, err) })
})();