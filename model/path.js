import path, { dirname } from "path";
import { fileURLToPath } from "url";

const _path = process.cwd().replace(/\\/g, "/");
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// 插件根目录 /../../plugins/juhkff-plugin
const pluginRoot = path.dirname(_dirname);
// 插件名 juhkff-plugin
const pluginName = path.basename(pluginRoot);
// 插件资源目录 /../../plugins/juhkff-plugin/resources
const pluginResources = path.join(pluginRoot, "resources");
const pluginData = path.join(pluginRoot, "data");

export { _path, pluginName, pluginRoot, pluginResources, pluginData };
