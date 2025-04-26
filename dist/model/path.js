"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginData = exports.pluginResources = exports.pluginRoot = exports.pluginName = exports._path = void 0;
const path_1 = __importDefault(require("path"));
const _path = process.cwd().replace(/\\/g, '/');
exports._path = _path;
// 插件根目录 /../../plugins/juhkff-plugin
const pluginRoot = path_1.default.dirname(__dirname);
exports.pluginRoot = pluginRoot;
// 插件名 juhkff-plugin
const pluginName = path_1.default.basename(pluginRoot);
exports.pluginName = pluginName;
// 插件资源目录 /../../plugins/juhkff-plugin/resources
const pluginResources = path_1.default.join(pluginRoot, "resources");
exports.pluginResources = pluginResources;
const pluginData = path_1.default.join(pluginRoot, "data");
exports.pluginData = pluginData;
//# sourceMappingURL=path.js.map