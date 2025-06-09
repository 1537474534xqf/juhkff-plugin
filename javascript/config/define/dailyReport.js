import path from "path";
import fs from "fs";
import YAML from "yaml";
import chokidar from "chokidar";
import lodash from "lodash";
import { PLUGIN_CONFIG_DIR, PLUGIN_DEFAULT_CONFIG_DIR } from "../../model/path.js";
import { configFolderCheck, configSync, getFileHash } from "../common.js";
import { deleteJob } from "../../utils/job.js";
import { EVENT_UPDATE_DAILY_REPORT_PUSH_TIME, DAILY_REPORT_GENERATE, EVENT_UPDATE_DAILY_REPORT_GENERATE_TIME, DAILY_REPORT_PUSH } from "../../model/constant.js";
export const dailyReportConfig = {};
(() => {
    const file = path.join(PLUGIN_CONFIG_DIR, `dailyReport.yaml`);
    const defaultFile = path.join(PLUGIN_DEFAULT_CONFIG_DIR, `dailyReport.yaml`);
    if (configFolderCheck(file, defaultFile))
        logger.info(`[JUHKFF-PLUGIN]创建日报配置`);
    let lastHash = getFileHash(fs.readFileSync(file, "utf8"));
    const sync = (() => {
        const func = () => {
            const userConfig = YAML.parse(fs.readFileSync(file, "utf8"));
            const defaultConfig = YAML.parse(fs.readFileSync(defaultFile, "utf8"));
            configSync(userConfig, defaultConfig);
            Object.assign(dailyReportConfig, userConfig);
        };
        func();
        return func;
    })();
    // 使用 eventBus 监听避免循环依赖
    const afterUpdate = (previous) => {
        if (dailyReportConfig.useDailyReport) {
            if (dailyReportConfig.push != previous.push || dailyReportConfig.useDailyReport != previous.useDailyReport || dailyReportConfig.dailyReportTime != previous.dailyReportTime) {
                Bot.emit(EVENT_UPDATE_DAILY_REPORT_PUSH_TIME);
            }
            if (dailyReportConfig.preHandle != previous.preHandle || dailyReportConfig.useDailyReport != previous.useDailyReport || dailyReportConfig.preHandleTime != previous.preHandleTime) {
                Bot.emit(EVENT_UPDATE_DAILY_REPORT_GENERATE_TIME);
            }
        }
        else {
            deleteJob(DAILY_REPORT_PUSH);
            deleteJob(DAILY_REPORT_GENERATE);
        }
    };
    chokidar.watch(file).on("change", () => {
        const content = fs.readFileSync(file, "utf8");
        const hash = getFileHash(content);
        if (hash === lastHash)
            return;
        const previous = lodash.cloneDeep(dailyReportConfig);
        sync();
        afterUpdate(previous);
        lastHash = hash;
        logger.info(logger.grey(`[JUHKFF-PLUGIN]同步日报配置`));
    }).on("error", (err) => { logger.error(`[JUHKFF-PLUGIN]日报配置同步异常`, err); });
})();
//# sourceMappingURL=dailyReport.js.map