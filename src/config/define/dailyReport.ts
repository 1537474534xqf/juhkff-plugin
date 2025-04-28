import { CronExpression } from "../../type.js";

export type DailyReport = {
    useDailyReport: boolean;
    alapiToken: string;
    dailyReportFullShow: boolean;
    push: boolean;
    dailyReportTime: CronExpression;
}

export const dailyReport: DailyReport = {
    useDailyReport: true,
    alapiToken: "",
    dailyReportFullShow: true,
    push: true,
    dailyReportTime: "0 0 12 * * ?"
}
