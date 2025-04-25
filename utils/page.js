/**
 * @file: page.js
 * @description: 通过 puppeteer 将模板转换为图片
 */

import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import template from "art-template";
import { pathToFileURL } from "url";
import { pluginResources } from "#juhkff.path";

/**
 * @description Yunzai内置puppeteer实现太模糊 重新实现
 * @notice
 * - 对于`data.x` 在模板中直接使用`{{x}}` 不需要加`data.`前缀
 * - 会在模板文件同级目录下生成output文件夹在其中存储生成的网页
 * - 会自动将模板中的href和src属性的链接嵌套一层`../`
 * @param {*} templatePath 模板文件路径，精确到文件后缀
 * @param {*} data 模板需要注入的变量
 * @returns imageBuffer
 */
export async function renderPage(templatePath, data) {
    // 启动浏览器
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();

    // 在同级目录下生成output文件夹在其中存储生成的网页
    var savePath = path.join(path.dirname(templatePath), "output", path.basename(templatePath));
    if (!fs.existsSync(path.dirname(savePath))) {
        fs.mkdirSync(path.dirname(savePath), { recursive: true });
    }

    // 读取模板文件
    var templateContent = fs.readFileSync(templatePath, "utf-8");
    // 渲染模板
    var renderedContent = template.render(templateContent, data);

    // !为便于调试，将引用的css、图片等链接嵌套一层../
    await page.setContent(renderedContent, { waitUntil: "networkidle2" });
    await page.evaluate(() => {
        document.querySelectorAll("link").forEach((link) => {
            if (!link.href.startsWith("/") && !link.href.startsWith("http")) link.href = `../${link.href}`;
        });
        document.querySelectorAll("img").forEach((img) => {
            if (!img.src.startsWith("/") && !img.src.startsWith("http")) img.src = `../${img.src}`;
        });
    });
    var modifiedContent = await page.content();
    // !需要调试可在savePath处查看生成的页面
    fs.writeFileSync(savePath, modifiedContent);

    // 为保证相对路径正确，需要重新goto
    await page.goto(`${pathToFileURL(savePath)}`, { waitUntil: "networkidle2" });

    // 动态获取body的宽高
    const { width, height } = await page.evaluate(() => {
        const body = document.body;
        return {
            width: Math.ceil(body.scrollWidth),
            height: Math.ceil(body.scrollHeight)
        };
    });

    // 根据body尺寸调整视口
    // !deviceScaleFactor 清晰度核心参数
    await page.setViewport({ width: width, height: height, deviceScaleFactor: 5 });

    var buffer = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width, height }, // 使用精确的body尺寸
        omitBackground: true,
    });

    if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(buffer);

    // 关闭浏览器
    await browser.close();

    return buffer;
}


export async function generateDailyReport(data) {
    // 定义模板路径和名称
    const templatePath = path.join(
        pluginResources,
        "daily_report",
        "main.html"
    );
    // 定义页面设置
    const viewport = {
        width: 578,
        height: 1885,
        deviceScaleFactor: 5,
    };
    // 启动浏览器
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();

    // 设置视口大小
    await page.setViewport(viewport);

    // 设置基础 URL
    await page.goto(`file://${templatePath}`, { waitUntil: "networkidle2" });

    // 将数据注入到页面中
    await page.evaluate((data) => {
        // 使用 JavaScript 将数据插入到 HTML 中
        document.querySelector(".top-date-week").textContent = data.week;
        document.querySelector(".top-date-date").textContent = data.date;
        document.querySelector(".top-date-cn").textContent = data.zh_date;

        // 渲染节日信息
        const festivalContainer = document.querySelector(".moyu-border");
        festivalContainer.innerHTML = `      <div class="moyu-title"><img src="./res/icon/fish.png" class="title-img">摸鱼日历</div>
        ${data.data_festival
                .map(
                    (fes) =>
                        `<p class="moyu-inner">距离<span class="moyu-day-name">${fes[1]}</span>还剩<span class="moyu-day">${fes[0]}</span>天</p>`
                )
                .join("")}    `;

        // 渲染 B站热点
        const biliContainer = document.querySelector(".bili-border");
        biliContainer.innerHTML = `      <div class="moyu-title" style="left: 128px;"><img src="./res/icon/bilibili.png" class="title-img">B站热点</div>
        ${data.data_bili
                .map((s) =>
                    s.icon
                        ? `<p class="bili-text"><img class="hot-img" src="${s.icon}" />${s.keyword}</p>`
                        : `<p class="bili-text"><img class="hot-img" style="margin-right: 0;" />${s.keyword}</p>`
                )
                .join("")}    `;

        // 渲染今日新番
        const animeContainer = document.querySelector(".two-border-border");
        animeContainer.innerHTML = `      ${data.data_anime
            .map(
                (s) =>
                    `<div class="anime-border"><img src="${s.image}" class="anime-img"><p class="anime-text">${s.name}</p></div>`
            )
            .join("")}    `;

        // 渲染60S读世界
        const sixContainer = document.querySelector(".three-border ul");
        sixContainer.innerHTML = `      ${data.data_six
            .map(
                (s) =>
                    `<li class="${data.full_show ? "full-show-text" : "normal-text"
                    }">${s}</li>`
            )
            .join("")}    `;

        // 渲染IT资讯
        const itContainer = document.querySelector(".four-border ul");
        itContainer.innerHTML = `      ${data.data_it
            .map(
                (s) =>
                    `<li class="${data.full_show ? "full-show-text" : "normal-text"
                    }">${s}</li>`
            )
            .join("")}    `;

        // 渲染今日一言
        document.querySelector(
            ".five-border p"
        ).textContent = `“${data.data_hitokoto}”`;
    }, data);
    // 等待图片加载完成
    await page.waitForSelector(".anime-img", { timeout: 50000 });
    await page.waitForNetworkIdle({ idleTime: 5000, timeout: 50000 });

    // 截图
    var imageBuffer = await page.screenshot({
        type: "png",
        fullPage: true,
    });
    if (!Buffer.isBuffer(imageBuffer)) imageBuffer = Buffer.from(imageBuffer);
    // 关闭浏览器
    await browser.close();

    return imageBuffer;
}
