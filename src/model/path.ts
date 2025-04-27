import path from "path";
import { fileURLToPath } from "url";

// const _path = process.cwd().replace(/\\/g, "/");
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

/**
 * 当前工作目录（标准化为 Unix 风格路径）
 */
const WORKING_DIR: string = process.cwd().replace(/\\/g, '/');

/**
 * 插件根目录（如 /project/plugins/juhkff-plugin）
 */
const PLUGIN_ROOT_DIR: string = path.dirname(_dirname);

/**
 * 插件名称（从路径中提取）
 */
const PLUGIN_NAME: string = path.basename(PLUGIN_ROOT_DIR);

/**
 * 插件资源目录路径
 */
const PLUGIN_RESOURCES_DIR: string = path.join(PLUGIN_ROOT_DIR, "resources");

/**
 * 插件数据目录路径
 */
const PLUGIN_DATA_DIR: string = path.join(PLUGIN_ROOT_DIR, "data");

// 使用命名导出（更符合 TS 模块规范）
export {
    WORKING_DIR,
    PLUGIN_NAME,
    PLUGIN_ROOT_DIR,
    PLUGIN_RESOURCES_DIR,
    PLUGIN_DATA_DIR
};

// 如果需要默认导出（可选）
export default {
    WORKING_DIR,
    PLUGIN_NAME,
    PLUGIN_ROOT_DIR,
    PLUGIN_RESOURCES_DIR,
    PLUGIN_DATA_DIR
};