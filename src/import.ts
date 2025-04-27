/*-------------------------------- 声明全局变量 --------------------------------*/
declare const Bot: any;
declare const redis: any;
declare const logger: any;
declare const plugin: any;
declare const Renderer: any;
declare const segment: any;


/*-------------------------------- 声明没有内置声明的导入模块 --------------------------------*/
declare module 'lunar-javascript' {
    export class Lunar {
        static fromDate(date: Date): Lunar;
        static fromYmd(year: number, month: number, day: number): Lunar;
        getSolar(): { getYear(): number; getMonth(): number; getDay(): number; };
        getJieQi(): string;
        getYearInChinese(): string;
        getMonthInChinese(): string;
        getDayInChinese(): string;
    }
}

declare module 'fast-image-size' {
    export default function fastImageSize(args0: Buffer | string): { width: number; height: number };
}