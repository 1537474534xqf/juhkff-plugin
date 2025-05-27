/**
 * @file tools.ts
 * @author: juhkff
 * @fileoverview 工具函数类
 */
import fs from "fs";
import path from "path";
/**
 * 获取指定文件夹内的随机图片
 * @param imageUrls 本地文件夹路径
 * @returns 图片路径
 */
export function getRandomUrl(imageUrls) {
    let imageUrl;
    if (Array.isArray(imageUrls)) {
        imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    }
    else {
        imageUrl = imageUrls;
    }
    if (fs.existsSync(imageUrl) && fs.lstatSync(imageUrl).isDirectory()) {
        let imageFiles = getAllImageFiles(imageUrl);
        if (imageFiles.length > 0) {
            imageUrl = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        }
    }
    logger.info("[tools]图片url：" + imageUrl);
    return imageUrl;
}
/**
 * 递归获取指定文件夹及其子文件夹内的所有图片
 * @param dirPath 本地文件夹路径
 * @param imageFiles 图片路径数组引用
 * @returns 入参中的图片路径数组
 */
export function getAllImageFiles(dirPath, imageFiles = []) {
    let files = fs.readdirSync(dirPath);
    for (let i = 0; i < files.length; i++) {
        let filePath = path.join(dirPath, files[i]);
        if (fs.statSync(filePath).isDirectory()) {
            imageFiles = getAllImageFiles(filePath, imageFiles);
        }
        else if ([".jpg", ".png", ".gif", ".jpeg", ".webp"].includes(path.extname(filePath))) {
            imageFiles.push(filePath);
        }
    }
    return imageFiles;
}
/**
 * 递归获取目录下所有文件
 * @param dir 目录路径
 * @param fileList 文件列表，作为输出
 */
export function getAllFiles(dir, fileList) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        }
        else {
            fileList.push(filePath);
        }
    });
}
