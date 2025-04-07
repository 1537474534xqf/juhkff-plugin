/**
 * @description: 对象工具类
 */
export default class Objects {
  /**
   * 判断对象是否为空，包括空字符串，空数组，空对象
   * @param {*} obj
   * @returns boolean
   */
  static isNull(obj) {
    if (!obj || obj === null || obj === undefined) return true;
    if (Array.isArray(obj)) {
      return obj.length === 0;
    }
    if (typeof obj === "string" || obj instanceof String) {
      return obj.trim() === "";
    }
  }

  /**
   * 判断多个对象中是否有空对象
   * @param  {...any} objs
   * @returns boolean
   */
  static hasNull(...objs) {
    return objs.some((obj) => Objects.isNull(obj));
  }
}

export class Base64 {
  static getBase64ImageType(base64) {
    // 将Base64数据解码为二进制数据
    const binaryData = Buffer.from(base64, "base64");

    // 获取前几个字节作为魔数（magic number）
    const magicNumber = binaryData.slice(0, 8).toString("hex").toUpperCase();

    // 根据魔数确定图片类型
    switch (magicNumber) {
      case "89504E470D0A1A0A":
        return "data:image/png;base64,";
      case "FFD8FFE0":
      case "FFD8FFE1":
      case "FFD8FFE2":
      case "FFD8FFE3":
      case "FFD8FFE8":
        return "data:image/jpeg;base64,";
      case "474946383761":
      case "474946383961":
        return "data:image/gif;base64,";
      case "424D":
        return "data:image/bmp;base64,";
      case "52494646":
        // WebP文件的魔数后面跟着文件大小，再跟着57454250
        return "data:image/webp;base64,";
      case "49492A00":
      case "4D4D002A":
        return "data:image/tiff;base64,";
      default:
        return null;
    }
  }
}
