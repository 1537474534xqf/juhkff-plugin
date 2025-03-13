export default class Objects {
  static isNull(obj) {
    if (obj === null || obj === undefined) return true;
    var str = String(obs);
    return str.trim() === "";
  }

  static hasNull(...objs) {
    return objs.some((obj) => Objects.isNull(obj));
  }
}
