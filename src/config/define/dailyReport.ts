import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { CronExpression } from "../../type.js";
import { configFolderCheck, configSync } from "../common.js";

export type DailyReport = {
    useDailyReport: boolean;
    alapiToken: string;
    dailyReportFullShow: boolean;
    push: boolean;
    dailyReportTime: CronExpression;
    pushGroupList: string[];
}

export let dailyReportConfig: DailyReport = null;

(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `dailyReport.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `dailyReport.yaml`);
    if (configFolderCheck(file, defaultFile)) logger.info(`[JUHKFF-PLUGIN]创建日报配置`);

    dailyReportConfig = YAML.parse(fs.readFileSync(file, "utf8")) as DailyReport;
    const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8")) as DailyReport;

    configSync(dailyReportConfig, defaultConfig);
    fs.writeFileSync(file, YAML.stringify(dailyReportConfig));

    chokidar.watch(file).on("change", () => {
        dailyReportConfig = YAML.parse(fs.readFileSync(file, "utf8"));
        logger.info(`[JUHKFF-PLUGIN]同步日报配置`);
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]日报同步配置异常`, err) })
})();