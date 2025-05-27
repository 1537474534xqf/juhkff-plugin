import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../../common.js";

export type DouBao = {
    useDouBao: boolean;
    apiKey: string;
    useVideoGenerate: boolean;
    videoGenerate: {
        url: string;
        model: string;
    };
    useImageGenerate: boolean;
    imageGenerate: {
        url: string;
        model: string
        size: string;
        seed: number;
        guidance_scale: number;
        watermark: boolean;
    };
    imageService: {
        host: string;
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        service: string;
        action: string;
        version: string;
    };
    useImageImitate: boolean;
    imageImitate: {
        reqKey: string;
        useSr: boolean;
        returnUrl: boolean;
    };
    useImageStyle: boolean;
    imageStyle: {
        reqKeyMap: Record<string, string>[];
        subReqKeyMap: Record<string, string>[];
        returnUrl: boolean;
    };
    songService: {
        host: string;
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        service: string;
    };
    /*
    useLyricsGenerate: boolean;
    lyricsGenerate: {
        action: string;
        version: string;
        genre: string;
        mood: string;
        gender: string;
        modelVersion: string;
    }
    */
    useSongGenerate: boolean;
    songGenerate: {
        action: string;
        version: string;
        genre: string;
        mood: string;
        gender: string;
        timbre: string;
        skipCopyCheck: boolean;
        queryAction: string;
        queryVersion: string;
        returnLyrics: boolean;
    };
    useBgmGenerate: boolean;
    bgmGenerate: {
        action: string;
        version: string;
        genre: string;
        mood: string;
        instrument: string;
        theme: string;
        queryAction: string;
        queryVersion: string;
    }
}

export const douBaoConfig: DouBao = {} as DouBao;

(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, "ai", `douBao.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, "ai", `douBao.yaml`);
    if (configFolderCheck(file, defaultFile)) logger.info(`[JUHKFF-PLUGIN]创建豆包配置`);

    let lastHash: string = getFileHash(fs.readFileSync(file, "utf8"));

    const sync = (() => {
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as DouBao;
            const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8")) as DouBao;
            configSync(userConfig, defaultConfig);
            Object.assign(douBaoConfig, userConfig);
            fs.writeFileSync(file, YAML.stringify(douBaoConfig));
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
        logger.info(`[JUHKFF-PLUGIN]同步豆包配置`);
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]豆包同步配置异常`, err) })
})();