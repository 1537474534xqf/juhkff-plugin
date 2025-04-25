/**
 * @file: date.js
 * @description: 日期相关
 */

import { Lunar } from "lunar-javascript";

// 定义2025年农历节日的农历日期
const lunarFestivals = {
    春节: [1, 1], // 春节 (农历正月初一)
    端午节: [5, 5], // 端午节 (农历五月初五)
    中秋节: [8, 15], // 中秋节 (农历八月十五)
};

// 固定日期的节日
const fixedFestivalsDates = {
    劳动节: new Date(2025, 4, 1), // 劳动节 (注意：月份从0开始)
    国庆节: new Date(2025, 9, 1), // 国庆节
    元旦: new Date(2025, 0, 1), // 元旦
};

function getNextYearFestivalDate(festivalName, currentFestivalDate) {
    let nextFestivalDate;
    if (lunarFestivals[festivalName]) {
        const nextYear = currentFestivalDate.getFullYear() + 1;
        const [month, day] = lunarFestivals[festivalName];
        nextFestivalDate = Lunar.fromYmd(nextYear, month, day).getSolar();
        nextFestivalDate = new Date(
            nextFestivalDate.getYear(),
            nextFestivalDate.getMonth() - 1,
            nextFestivalDate.getDay()
        );
    } else {
        nextFestivalDate = new Date(currentFestivalDate);
        nextFestivalDate.setFullYear(nextFestivalDate.getFullYear() + 1);
    }
    return nextFestivalDate;
}

function findTombSweepingDay(year) {
    let startDate = new Date(year, 2, 20); // 3月20日
    let springEquinox = startDate;
    for (let i = 0; i < 3; i++) {
        const lunarDate = Lunar.fromDate(startDate);
        if (lunarDate.getJieQi() === "春分") {
            springEquinox = startDate;
            break;
        }
        startDate.setDate(startDate.getDate() + 1);
    }
    springEquinox.setDate(springEquinox.getDate() + 15);
    return springEquinox;
}

function daysUntilFestival(festivalName, today, festivalDate) {
    if (festivalDate < today) {
        const nextFestivalDate = getNextYearFestivalDate(
            festivalName,
            festivalDate
        );
        return Math.ceil((nextFestivalDate - today) / (1000 * 60 * 60 * 24));
    } else {
        return Math.ceil((festivalDate - today) / (1000 * 60 * 60 * 24));
    }
}

function getLunarFestivalsDates(today) {
    const year = today.getFullYear();
    return Object.fromEntries(
        Object.entries(lunarFestivals).map(([name, [month, day]]) => {
            const solarDate = Lunar.fromYmd(year, month, day).getSolar();
            return [
                name,
                new Date(
                    solarDate.getYear(),
                    solarDate.getMonth() - 1,
                    solarDate.getDay()
                ),
            ];
        })
    );
}

/**
 * 获取节日日期
 * @returns {Array} 节日日期列表
 */
export async function getFestivalsDates() {
    const today = new Date();
    const lunarFestivalsDates = getLunarFestivalsDates(today);
    lunarFestivalsDates["清明节"] = findTombSweepingDay(today.getFullYear());
    for (var name in fixedFestivalsDates) {
        fixedFestivalsDates[name].setFullYear(today.getFullYear());
    }
    const festivalsDates = { ...lunarFestivalsDates, ...fixedFestivalsDates };

    const sortName = [
        "春节",
        "端午节",
        "中秋节",
        "清明节",
        "劳动节",
        "国庆节",
        "元旦",
    ];

    const dataList = [];
    for (const name of sortName) {
        if (festivalsDates[name]) {
            const daysLeft = daysUntilFestival(name, today, festivalsDates[name]);
            dataList.push([daysLeft, name]);
        } else {
            dataList.push([-1, name]);
        }
    }
    dataList.sort((a, b) => a[0] - b[0]);
    return dataList;
}

/**
 * 格式化日期，精确到天，可选农历公历
 * @param {number} timestamp 时间戳
 * @param {en | zh} format 格式，默认为公历
 * @returns {string} 格式化后的日期
 */
export async function formatDate(timestamp, format = "en") {
    if (format === "en") {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    } else if (format === "zh") {
        const date = new Date(timestamp);
        const lunar = Lunar.fromDate(date);
        //   const lunarYear = lunar.getYearInChinese();
        const lunarMonth = lunar.getMonthInChinese();
        const lunarDay = lunar.getDayInChinese();
        //   return `${lunarYear}年${lunarMonth}${lunarDay}`;
        return `${lunarMonth}${lunarDay}`;
    }
}

/**
 * 格式化日期，精确到秒
 * @param {number} timestamp 
 * @returns {string} 格式化后的日期
 */
export function formatDateDetail(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，需要加1
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}