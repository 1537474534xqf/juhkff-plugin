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
