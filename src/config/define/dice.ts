import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import lodash from "lodash";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";

export type Dice = {
    useDice: boolean;
    default: string;
    briefMode: boolean;
    presets: {
        name: string;   // 骰子名称，例如："六面骰"、"方向骰"
        isNumber: boolean;    // 1：数字类型，0：字符串类型
        faces: (number | string)[]; // 每个面的值，例如：[1,2,3,4,5,6] 或 ["上", "下", "左", "右"]
    }[];
    packs: {
        name: string;
        bundle: {
            name: string;
            count: number;
        }[]
    }[]
}

export const diceConfig: Dice = {} as Dice;

(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `dice.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `dice.yaml`);
    if (configFolderCheck(file, defaultFile)) logger.info(`- [JUHKFF-PLUGIN] 创建骰子配置`);

    let lastHash: string = getFileHash(fs.readFileSync(file, "utf8"));

    const sync = (() => {
        const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as Dice;
        const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8")) as Dice;
        configSync(userConfig, defaultConfig);
        fs.writeFileSync(file, YAML.stringify(userConfig));
        Object.assign(diceConfig, userConfig);
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8")) as Dice;
            Object.assign(diceConfig, userConfig);
        }
        return func;
    })();

    const afterUpdate = (previous: Dice) => { }

    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash) return;
        const previous = lodash.cloneDeep(diceConfig);
        sync();
        afterUpdate(previous);
        lastHash = hash;
        logger.info(logger.grey(`- [JUHKFF-PLUGIN] 同步骰子配置`));
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN] 骰子配置同步异常`, err) })
})();
