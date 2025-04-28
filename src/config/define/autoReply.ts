import path from "path";
import { PLUGIN_CONFIG_DIR } from "../../model/path.js";
import { CronExpression } from "../../type.js";
import fs from "fs";

type GroupChatRate = {
    groupList: number[];
    chatRate: number;
    replyAtBot: boolean;
}

export type AutoReply = {
    useAutoReply: boolean;
    attachUrlAnalysis: boolean;
    useContext: boolean;
    maxHistoryLength: number;
    chatApi: string;
    chatApiKey: string
    chatModel: string
    apiCustomUrl: string
    defaultChatRate: number
    defaultReplyAtBot: boolean
    groupChatRate: GroupChatRate[];
    useVisual: boolean;
    visualReplaceChat: boolean;
    visualApi: string;
    visualApiKey: string;
    visualModel: string;
    visualApiCustomUrl: string;
    // textToPaintPrompt: string;
    chatPrompt: string;
    oldPrompt: string[];
    useEmotion: boolean;
    emotionGenerateTime: CronExpression;
    emotionGeneratePrompt: string;
}

export const autoReply: AutoReply = {
    useAutoReply: false,
    attachUrlAnalysis: false,
    useContext: false,
    maxHistoryLength: 5,
    chatApi: "",
    chatApiKey: "",
    chatModel: "",
    apiCustomUrl: "",
    defaultChatRate: 0.1,
    defaultReplyAtBot: true,
    groupChatRate: [],
    useVisual: false,
    visualReplaceChat: false,
    visualApi: "",
    visualApiKey: "",
    visualModel: "",
    visualApiCustomUrl: "",
    // textToPaintPrompt:  "",
    chatPrompt: "",
    oldPrompt: [],
    useEmotion: false,
    emotionGenerateTime: "0 0 4 * * ?",
    emotionGeneratePrompt: ""
};

if (!fs.existsSync(PLUGIN_CONFIG_DIR)) {
    throw new Error("插件缺失配置文件夹");
}
var files = this.getAllFiles(defaultConfigDir).filter((f) =>
    f.endsWith(".yaml")
);
for (const defaultFile of files) {
    const app = path.basename(defaultFile, ".yaml");
    // 获取相对于 defaultConfigDir 的路径，并去掉 .yaml 扩展名
    const relativePath = path.relative(defaultConfigDir, defaultFile);
    const dirPath = path.dirname(path.join(this.configPath, relativePath));
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    if (!fs.existsSync(path.join(this.configPath, `${relativePath}`))) {
        // 复制 default 内对应的 yaml 文件到 config/*.yaml 中
        fs.copyFileSync(
            path.join(defaultConfigDir, `${relativePath}`),
            path.join(this.configPath, `${relativePath}`)
        );
        logger.info(`已复制 ${app} 默认配置文件`);
    }
    var file = path.join(this.configPath, `${relativePath}`);
    if (app in Config) {
        throw new Error(`[${app}] 配置文件不止一个`);
    }

    this.appFile[app] = file;

    try {
        // 先读取用户配置文件
        Config[app] = YAML.parse(fs.readFileSync(file, "utf8"));
        var defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8"));
        // 对预设单独处理，将旧预设自动更新为新预设
        var oldPromptList = defaultConfig["oldPrompt"];
        if (!Objects.isNull(oldPromptList)) {
            var curPrompt = Config["autoReply"]["chatPrompt"];
            if (oldPromptList.includes(curPrompt.trim())) {
                Config["autoReply"]["chatPrompt"] = defaultConfig["chatPrompt"];
            }
        }

        // 处理多层级配置
        // TODO 增量更新时会很难处理，还涉及到列表的一些判断问题，很麻烦，直接写个建议重装得了
        function mergeAndCleanConfig(userConfig: Record<string, any>, defaultConfig: Record<string, any>) {
            for (var key in defaultConfig) {
                if (userConfig.hasOwnProperty(key)) {
                    // userConfig[key] !== null ?
                    if (typeof userConfig[key] === 'object' && userConfig[key] !== null && typeof defaultConfig[key] === 'object' && defaultConfig[key] !== null) {
                        // 递归处理嵌套对象
                        mergeAndCleanConfig(userConfig[key], defaultConfig[key]);
                    } else {
                        // 删除 defaultConfig 中存在的键
                        delete defaultConfig[key];
                    }
                } else {
                    // 用户配置中没有的配置，添加到用户配置中
                    userConfig[key] = defaultConfig[key];
                }
            }
        }

        // 优先使用用户配置文件，添加缺少的配置，便于版本更新同步
        mergeAndCleanConfig(Config[app], defaultConfig);

        // 手动删除不应同步的配置
        delete Config[app]["oldPrompt"];  // 预设默认值更新

        // 保存用户配置文件
        fs.writeFileSync(file, YAML.stringify(Config[app]));
    } catch (error) {
        throw new Error(`[${app}.yaml] 格式错误 ${error}`);
    }
}