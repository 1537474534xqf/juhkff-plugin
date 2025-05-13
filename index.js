import fs, { appendFile } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from 'url';

const _filename = fileURLToPath(import.meta.url);
// 插件根目录 /../../plugins/juhkff-plugin
const pluginRoot = path.dirname(_filename);

if (!global.segment) {
    global.segment = (await import("oicq")).segment;
}

let ret = [];

logger.info(logger.yellow("- 正在载入 JUHKFF-PLUGIN"));
logger.info("- [JUHKFF-PLUGIN] 如果插件更新后出现问题，可能是新的配置同步时出现错误，可以尝试删除并重装该插件");
logger.info(logger.red("- [JUHKFF-PLUGIN] 近期更新中插件配置结构有所更改，请在锅巴页面重新配置相关配置（变动项：群聊配置-常规接口配置|视觉接口配置、偷图配置-发送偷图概率|本地图库路径）"));

async function getFiles(dir) {
    const dirs = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        dirs.map((each) => {
            const res = path.resolve(dir, each.name);
            return each.isDirectory() ? getFiles(res) : res;
        })
    );
    return Array.prototype.concat(...files);
}

const appFiles = await getFiles(path.join(pluginRoot, "javascript", "apps")).then((files) =>
    files.filter((file) => file.endsWith(".js"))
);

const bgProcessFiles = await getFiles(path.join(pluginRoot, "javascript", "bgProcess")).then((files) =>
    files.filter((file) => file.endsWith(".js"))
);

const pluginFiles = await getFiles(path.join(pluginRoot, "javascript", "plugin")).then((files) =>
    files.filter((file) => file.endsWith(".js"))
);

const files = [...appFiles, ...bgProcessFiles, ...pluginFiles];

files.forEach((file) => {
    file = pathToFileURL(file).href;  // 支持 Windows 路径
    ret.push(import(file));
});

ret = await Promise.allSettled(ret);

let apps = {};
for (let i in files) {
    let name = files[i].replace(".js", "");

    if (ret[i].status !== "fulfilled") {
        logger.error(`载入插件错误：${logger.red(name)}`);
        logger.error(ret[i].reason);
        continue;
    }
    apps[name] = ret[i].value[Object.keys(ret[i].value)[0]];
}

logger.info(logger.green("- JUHKFF-PLUGIN 载入成功"));

export { apps };
