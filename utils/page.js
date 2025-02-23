/**
 * @file: page.js
 * @description: 通过 puppeteer 将模板转换为图片
 */

import puppeteer from "puppeteer";
export async function templateToPic(templatePath, data, viewport) {
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
            `<li class="${
              data.full_show ? "full-show-text" : "normal-text"
            }">${s}</li>`
        )
        .join("")}    `;
  
      // 渲染IT资讯
      const itContainer = document.querySelector(".four-border ul");
      itContainer.innerHTML = `      ${data.data_it
        .map(
          (s) =>
            `<li class="${
              data.full_show ? "full-show-text" : "normal-text"
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
    const imageBuffer = await page.screenshot({
      type: "png",
      fullPage: true,
    });
  
    // 关闭浏览器
    await browser.close();
  
    return imageBuffer;
  }
  