import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";

export type HelpGen = {
    useHelpGen: boolean;
    command: string;
    titleZh: string;
    titleEn: string;
    hd: boolean;
    colorOptions: {
        titleColor: string;
        labelColor: string;
        copyrightColor: string;
        groupColor: string;
        groupTitleColor: string;
        groupDescColor: string;
        helpNameColor: string;
        helpTitleColor: string;
        helpDescColor: string;
    }
    manualList: {
        name?: string;
        type: "active" | "passive" | "group" | "sub";
        command?: string;
        dsc?: string;
        enable?: boolean,
        belongTo?: string;
        subMenu?: any;
    }[];
}

export const helpGenConfig: HelpGen = {} as HelpGen;

(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `helpGen.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `helpGen.yaml`);
    if (configFolderCheck(file, defaultFile)) logger.info(`[JUHKFF-PLUGIN]创建帮助生成配置`);

    let lastHash: string = getFileHash(fs.readFileSync(file, "utf8"));

    const sync = (() => {
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as HelpGen;
            const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8")) as HelpGen;
            configSync(userConfig, defaultConfig);
            Object.assign(helpGenConfig, userConfig);
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
        logger.info(logger.grey(`[JUHKFF-PLUGIN]同步帮助生成配置`));
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]帮助生成配置同步异常`, err) })
})();
