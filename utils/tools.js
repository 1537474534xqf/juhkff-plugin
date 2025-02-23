/**
 * @file tools.js
 * @description 工具函数
 */

import fs from "fs";
import path from "path";

/**
 * 获取指定文件夹内的随机图片
 * @param {string} imageUrls 本地文件夹路径
 * @returns {string} imageUrl 图片路径
 */
export async function getRandomUrl(imageUrls) {
    let imageUrl;

    if (Array.isArray(imageUrls)) {
        imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    } else {
        imageUrl = imageUrls;
    }

    if (fs.existsSync(imageUrl) && fs.lstatSync(imageUrl).isDirectory()) {
        let imageFiles = await getAllImageFiles(imageUrl);

        if (imageFiles.length > 0) {
            imageUrl = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        }
    }

    logger.info("[tools]图片url：" + imageUrl);
    return imageUrl;
}

/**
 * 递归获取指定文件夹及其子文件夹内的所有图片
 * @param {string} dirPath 本地文件夹路径 
 * @param {string[]} imageFiles 图片路径数组引用
 * @returns {string[]} imageFiles 入参中的图片路径数组
 */
async function getAllImageFiles(dirPath, imageFiles = []) {
    let files = fs.readdirSync(dirPath);

    for (let i = 0; i < files.length; i++) {
        let filePath = path.join(dirPath, files[i]);

        if (fs.statSync(filePath).isDirectory()) {
            imageFiles = await getAllImageFiles(filePath, imageFiles);
        } else if (
            [".jpg", ".png", ".gif", ".jpeg", ".webp"].includes(
                path.extname(filePath)
            )
        ) {
            imageFiles.push(filePath);
        }
    }

    return imageFiles;
}