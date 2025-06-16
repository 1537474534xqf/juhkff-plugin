import fs from "fs";
import path from "path";
import YAML from "yaml";
import crypto from "crypto";
import { PLUGIN_CONFIG_DIR } from "../model/path.js";
/**
 * 检查配置文件夹是否存在，如果不存在则创建
 * @param file
 * @param defaultFile
 * @returns 存在返回false，不存在则创建并返回true
 */
export function configFolderCheck(file, defaultFile) {
    if (!fs.existsSync(PLUGIN_CONFIG_DIR)) {
        throw new Error("[JUHKFF-PLUGIN]插件缺失配置文件夹");
    }
    if (!fs.existsSync(path.dirname(file)))
        fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file)) {
        fs.copyFileSync(defaultFile, file);
        return true;
    }
    return false;
}
export function saveConfigToFile(config, ...pathRelativeToConfigFolder) {
    const file = path.join(PLUGIN_CONFIG_DIR, ...pathRelativeToConfigFolder);
    fs.writeFileSync(file, YAML.stringify(config));
}
/**
 * **新增配置项时，保证给该配置项空值而非null，例如字符串类型默认给""，数组类型默认给[]**
 *
 * 同步用户配置和默认配置，核心是保证结构相同
 * @param config
 * @param defaultConfig 修改：同步项不会被删除
 */
export function configSync(config, defaultConfig) {
    for (var key in defaultConfig) {
        // 用户配置中没有的配置，添加到用户配置中
        if (config[key] === undefined) {
            config[key] = defaultConfig[key];
            continue;
        }
        // 两者类型不同，将defaultConfig的值赋给用户配置
        // 处理类型不同的情况
        if (typeof config[key] !== typeof defaultConfig[key]) {
            config[key] = defaultConfig[key];
            continue;
        }
        if (typeof defaultConfig[key] != 'object') {
            // delete defaultConfig[key];
            continue;
        }
        // 特殊处理对象类型
        // 如果默认值是数组而用户值不是数组，或者反过来
        if (Array.isArray(defaultConfig[key]) !== Array.isArray(config[key])) {
            config[key] = defaultConfig[key];
            continue;
        }
        // 递归处理嵌套对象
        if (!Array.isArray(defaultConfig[key]) && !Array.isArray(config[key])) {
            configSync(config[key], defaultConfig[key]);
            if (Object.keys(defaultConfig[key]).length === 0) {
                // delete defaultConfig[key];
            }
            continue;
        }
        // 均为一般类型或数组类型就直接删除defaultConfig中的该项
        // delete defaultConfig[key];
    }
}
export function getFileHash(content) {
    return crypto.createHash("sha1").update(content).digest("hex");
}
;
