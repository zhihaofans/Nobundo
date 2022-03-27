const START_TIME = new Date().getTime(),
  { UserUUID } = require("./uuid"),
  $ = require("./$");

class AppKernel {
  constructor({ appId, modDir, l10nPath, debug }) {
    this.START_TIME = START_TIME;
    this.MOD_DIR = modDir;
    this.DEBUG = debug == true;
    this.AppConfig = JSON.parse($file.read("/config.json"));
    this.AppInfo = this.AppConfig.info;
    this.AppInfo.id = appId;
    this.DATA_DIR = {
      SHARED: "shared://zhihaofans/Core.js/",
      ICLOUD: "drive://zhihaofans/Core.js/",
      LOCAL: "/assets/.files/"
    };
    $.file.mkdirs(this.DATA_DIR.SHARED);
    $.file.mkdirs(this.DATA_DIR.ICLOUD);
    $.file.mkdirs(this.DATA_DIR.LOCAL);
    this.l10n(require(l10nPath));
    this.UUID = new UserUUID(this);
  }
  l10n(l10nRes) {
    const result = {};
    Object.keys(l10nRes).map(key => {
      const thisItem = l10nRes[key];
      Object.keys(thisItem).map(lang => {
        if (!result[lang]) {
          result[lang] = {};
        }
        result[lang][key] = thisItem[lang];
      });
    });
    $app.strings = result;
  }
  getLocale() {
    return $app.info.locale;
  }
  getString(id, lang = this.getLocale()) {
    return $app.strings[lang][id];
  }
  setSharedDataDir(path) {
    if (path) {
      this.DATA_DIR.SHARED = path;
      if (!this.DATA_DIR.SHARED.endsWith("/")) {
        this.DATA_DIR.SHARED += "/";
      }
      $.file.mkdirs(this.DATA_DIR.SHARED);
    }
  }
  setIcloudDataDir(path) {
    if (path) {
      this.DATA_DIR.ICLOUD = path;
      if (!this.DATA_DIR.ICLOUD.endsWith("/")) {
        this.DATA_DIR.ICLOUD += "/";
      }
      $.file.mkdirs(this.DATA_DIR.ICLOUD);
    }
  }
  setLocalDataDir(path) {
    if (path) {
      this.DATA_DIR.LOCAL = path;
      if (!this.DATA_DIR.LOCAL.endsWith("/")) {
        this.DATA_DIR.LOCAL += "/";
      }
      $.file.mkdirs(this.DATA_DIR.LOCAL);
    }
  }
  info(id, msg) {
    $console.info(msg ? `${id}:${msg}` : id);
  }
  warn(id, msg) {
    $console.warn(msg ? `${id}:${msg}` : id);
  }
  error(id, msg) {
    $console.error(msg ? `${id}:${msg}` : id);
  }
}

module.exports = { AppKernel, version: 1 };
