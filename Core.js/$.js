function error(message) {
  $console.error(message);
}
function getUUID() {
  return $text.uuid;
}
function info(message) {
  $console.info(message);
}
function toInt(data) {
  return Number.parseInt(data);
}
function warn(message) {
  $console.warn(message);
}
class Alert {
  constructor() {}
  show(title, message) {
    $ui.alert({
      title,
      message
    });
  }
}
class Datetime {
  constructor() {}
  getUnixTime() {
    return new Date().getTime();
  }
  getSecondUnixTime() {
    return Math.round(new Date().getTime() / 1000);
  }
  getTodayWhatTimeDate({ hours, minutes, seconds, milliseconds }) {
    const nowDate = new Date(),
      todayYear = nowDate.getFullYear(),
      todayMonth = nowDate.getMonth() + 1,
      todayDate = nowDate.getDate();
    return new Date(
      todayYear,
      todayMonth - 1,
      todayDate,
      hours || 0,
      minutes || 0,
      seconds || 0,
      milliseconds || 0
    );
  }
  getTomorrowWhatTimeDate({ hours, minutes, seconds, milliseconds }) {
    const nowDate = new Date(),
      todayYear = nowDate.getFullYear(),
      todayMonth = nowDate.getMonth() + 1,
      todayDate = nowDate.getDate();
    return new Date(
      todayYear,
      todayMonth - 1,
      todayDate + 1,
      hours || 0,
      minutes || 0,
      seconds || 0,
      milliseconds || 0
    );
  }
  async pickDate() {
    return await $picker.date({ props: { mode: 1 } });
  }
  async pickTime() {
    return await $picker.date({ props: { mode: 0 } });
  }
  async pickDateAndTime() {
    return await $picker.date({ props: { mode: 2 } });
  }
}
class File {
  constructor() {}
  isFile(filePath) {
    return !$file.isDirectory(filePath);
  }
  isFileExist(filePath) {
    return $file.exists(filePath) && !$file.isDirectory(filePath);
  }
  getPathLevelsList(path) {
    var newPath = path;
    if (path.endsWith("/")) {
      newPath = path.substring(0, path.length - 1);
    }
    if (newPath.startsWith("shared://")) {
      const pathStr = newPath.substring(9, path.length - 1);
      if (pathStr.indexOf("/") < 0) {
        return pathStr;
      }
      const levelsList = pathStr.split("/");
      levelsList[0] = "shared://" + levelsList[0];
      return levelsList;
    } else if (newPath.startsWith("drive://")) {
      const pathStr = newPath.substring(8, newPath.length);
      if (pathStr.indexOf("/") < 0) {
        return pathStr;
      }
      const levelsList = pathStr.split("/");
      levelsList[0] = "drive://" + levelsList[0];
      return levelsList;
    } else if (newPath.startsWith("/")) {
      const pathStr = newPath.substring(1, newPath.length),
        levelsList = pathStr.split("/");
      levelsList[0] = "/" + levelsList[0];
      return levelsList;
    }
    return undefined;
  }
  mkdirs(dir) {
    const pathLevelsList = this.getPathLevelsList(dir);
    if (pathLevelsList == undefined || pathLevelsList.length == 0) {
      return false;
    }
    var nextPath = "";
    pathLevelsList.map(path => {
      nextPath += path + "/";
      $file.mkdir(nextPath);
    });
  }
}
class Http {
  constructor() {}
  async get({ url, header, timeout }) {
    return await $http.get({
      url: url,
      timeout: timeout,
      header: header
    });
  }
  getObjFromCookies(cookies) {
    if (cookies) {
      const cookieResult = {};
      cookies.split(";").map(cookieItem => {
        const itemSplit = cookieItem.trim().split("="),
          itemKey = itemSplit[0],
          itemValve = itemSplit[1];

        cookieResult[itemKey] = itemValve;
      });
      return cookieResult;
    } else {
      return undefined;
    }
  }
  getCookiesStrFromObj(cookiesObj) {
    let cookiesStr = "";
    Object.keys(cookiesObj).map(key => {
      cookiesStr += key + "=" + cookiesObj[key] + ";";
    });
    return cookiesStr;
  }
  async head({ url, header, timeout }) {
    return await $http.request({
      method: "HEAD",
      url: url,
      timeout: timeout,
      header: header
    });
  }
  async post({ url, header, timeout, body }) {
    return await $http.post({
      url: url,
      header: header,
      timeout: timeout,
      body: body
    });
  }
}
class Share {
  constructor() {}
  isAction() {
    return $app.env == $env.action;
  }
  isSafari() {
    return $app.env == $env.safari;
  }
  getLink() {
    if (this.isAction()) {
      return $context.link || undefined;
    }
    if (this.isSafari()) {
      return $context.safari ? $context.safari.items.location.href : undefined;
    }
    return undefined;
  }
  getText() {
    return $context.text;
  }
}

class Str {
  constructor() {}
  hasString(string) {
    return this.isString(string) && string.length > 0;
  }
  isString(string) {
    return typeof string == "string";
  }
}

module.exports = {
  alert: new Alert(),
  dateTime: new Datetime(),
  error,
  getUUID,
  info,
  file: new File(),
  http: new Http(),
  share: new Share(),
  string: new Str(),
  toInt,
  warn
};
