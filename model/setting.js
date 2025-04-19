import YAML from "yaml";
import fs from "node:fs";
import { _path, pluginResources, pluginRoot } from "#juhkff.path";
import path from "path";
import Objects from "#juhkff.kits";

class Setting {
  constructor() {
    /** 用户设置 */
    this.appFile = {};
    this.configPath = path.join(pluginRoot, "config");
    this.config = this.initConfig();

    this.dataPath = path.join(pluginRoot, "data");
    this.data = {};
  }

  initConfig() {
    var config = {};
    if (!fs.existsSync(this.configPath)) {
      logger.error(`插件缺失配置文件夹`);
      return false;
    }
    var defaultConfigDir = path.join(this.configPath, "default");
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
      if (app in config) {
        logger.error(`[${app}] 配置文件不止一个`);
        return false;
      }

      this.appFile[app] = file;

      try {
        // 先读取用户配置文件
        config[app] = YAML.parse(fs.readFileSync(file, "utf8"));
        var defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8"));

        // 对预设单独处理，将旧预设自动更新为新预设
        var oldPromptList = defaultConfig["oldPrompt"];
        if (!Objects.isNull(oldPromptList)) {
          var curPrompt = config["autoReply"]["chatPrompt"];
          if (oldPromptList.includes(curPrompt.trim())) {
            config["autoReply"]["chatPrompt"] = defaultConfig["chatPrompt"];
          }
        }

        // 处理多层级配置
        // TODO 增量更新时会很难处理，还涉及到列表的一些判断问题，很麻烦，直接写个建议重装得了
        function mergeAndCleanConfig(userConfig, defaultConfig) {
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
        mergeAndCleanConfig(config[app], defaultConfig);

        // 手动删除不应同步的配置
        delete config[app]["oldPrompt"];  // 预设默认值更新
        
        // 保存用户配置文件
        fs.writeFileSync(file, YAML.stringify(config[app]));
      } catch (error) {
        logger.error(`[${app}.yaml] 格式错误 ${error}`);
        return false;
      }
    }
    return config;
  }

  // 获取所有应用配置
  getAllConfig() {
    return this.config;
  }

  setConfig(config) {
    this.config = config;
    // 保存
    for (var app in this.config) {
      try {
        var filePath = this.appFile[app];
        fs.writeFileSync(filePath, YAML.stringify(this.config[app]));
      } catch (error) {
        logger.error(`[${app}.yaml] 格式错误 ${error}`);
        return error;
      }
    }
    return null;
  }

  // 获取对应应用配置
  getConfig(app) {
    return this.config[app];
  }

  // 获取对应数据文件
  getData(folderPath, filename) {
    folderPath = path.join(this.dataPath, folderPath);
    try {
      if (!fs.existsSync(path.join(folderPath, `${filename}.yaml`))) {
        return false;
      }
      return YAML.parse(
        fs.readFileSync(path.join(folderPath, `${filename}.yaml`), "utf8")
      );
    } catch (error) {
      logger.error(`[${filename}] 读取失败 ${error}`);
      return false;
    }
  }

  // 递归获取目录下所有文件
  getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        this.getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    });
    return fileList;
  }
}

export default new Setting();
