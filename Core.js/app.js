const START_TIME = new Date().getTime(),
  NEED_JSBOX_VERSION = 1361,
  NOW_JSBOX_VERSION = Number.parseInt($app.info.build),
  { UserUUID } = require("./uuid"),
  { VersionException } = require("./object"),
  { Kernel } = require("./kernel"),
  $ = require("./$");
class AppKernel {
  constructor({ appId, modDir, l10nPath }) {
    this.START_TIME = START_TIME;
    this.MOD_DIR = modDir;
    this.DEBUG = $app.isDebugging;
    this.AppConfig = JSON.parse($file.read("/config.json"));
    this.AppInfo = this.AppConfig.info;
    this.AppInfo.id = appId;
    this.DATA_DIR = {
      SHARED: "shared://zhihaofans/Core.js/",
      ICLOUD: "drive://zhihaofans/Core.js/",
      LOCAL: "/assets/.files/"
    };
    this.DEFAULE_SQLITE_FILE = this.DATA_DIR.LOCAL + "mods.db";
    $.file.mkdirs(this.DATA_DIR.SHARED);
    $.file.mkdirs(this.DATA_DIR.ICLOUD);
    $.file.mkdirs(this.DATA_DIR.LOCAL);
    this.l10n(require(l10nPath));
    this.UUID = new UserUUID(this);
    if (this.DEBUG) {
      this.kernelDebug(`appName:${this.AppInfo.name}`);
      this.kernelDebug(`appId:${this.AppInfo.id}`);
      this.kernelDebug(`debug:${this.DEBUG}`);
    }
    this.checkJsboxVersion();
    this.WIDGET_MOD_ID = undefined;
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
    if (this.DEBUG) {
      $console.info(msg ? `${id}:${msg}` : id);
    }
  }
  warn(id, msg) {
    if (this.DEBUG) {
      $console.warn(msg ? `${id}:${msg}` : id);
    }
  }
  error(id, msg) {
    if (this.DEBUG) {
      $console.error(msg ? `${id}:${msg}` : id);
    }
  }
  kernelDebug(message) {
    if (this.DEBUG) {
      $console.info(`Kernel:${message}`);
    }
  }
  checkJsboxVersion() {
    if (NOW_JSBOX_VERSION < NEED_JSBOX_VERSION) {
      throw new VersionException({
        message: "需要更新JSBox",
        nowVersion: NOW_JSBOX_VERSION,
        needVersion: NEED_JSBOX_VERSION
      });
    }
  }
}

module.exports = { AppKernel, version: 1 };
