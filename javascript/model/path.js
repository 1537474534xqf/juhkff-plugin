import path from "path";
import { fileURLToPath } from "url";
// const _path = process.cwd().replace(/\\/g, "/");
const _filename = fileURLToPath(import.meta.url);
/**
 * 插件根目录（如 /project/plugins/juhkff-plugin）
 */
const PLUGIN_ROOT_DIR = path.resolve(_filename, '..', '..', '..');
/**
 * 插件名称（从路径中提取）
 */
const PLUGIN_NAME = path.basename(PLUGIN_ROOT_DIR);
/**
 * 插件资源目录路径
 */
const PLUGIN_RESOURCES_DIR = path.join(PLUGIN_ROOT_DIR, "resources");
/**
 * 插件数据目录路径
 */
const PLUGIN_DATA_DIR = path.join(PLUGIN_ROOT_DIR, "data");
// 使用命名导出（更符合 TS 模块规范）
export { PLUGIN_NAME, PLUGIN_ROOT_DIR, PLUGIN_RESOURCES_DIR, PLUGIN_DATA_DIR };
// 如果需要默认导出（可选）
export default {
    PLUGIN_NAME,
    PLUGIN_ROOT_DIR,
    PLUGIN_RESOURCES_DIR,
    PLUGIN_DATA_DIR
};
//# sourceMappingURL=path.js.map