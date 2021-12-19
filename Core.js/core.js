const CORE_VERSION = 2,
  { Result } = require("./object");
class Core {
  constructor({
    kernel,
    modId,
    modName,
    version,
    author,
    databaseId,
    needCoreVersion,
    keychainId
  }) {
    this.Kernel = kernel;
    this.$_ = require("./$_");
    this.Storage = require("./storage");
    this.AppScheme = require("AppScheme");

    this.Http = require("./lib").Http;
    this.MOD_ID = modId;
    this.MOD_NAME = modName ?? "core";
    this.MOD_VERSION = version ?? 1;
    this.MOD_AUTHOR = author ?? "zhihaofans";
    this.NEED_CORE_VERSION = needCoreVersion ?? 0;
    this.DATABASE_ID = this.NEED_DATABASE ? databaseId : "";
    this.SQLITE_FILE = this.Kernel.DEFAULE_SQLITE_FILE || undefined;
    this.SQLITE =
      this.DATABASE_ID.length > 0 && this.SQLITE_FILE
        ? this.initSQLite()
        : undefined;
    this.KEYCHAIN_DOMAIN = `nobundo.mod.${keychainId}`;
    this.Keychain =
      keychainId && keychainId.length > 0
        ? new this.Storage.Keychain(this.KEYCHAIN_DOMAIN)
        : undefined;
  }
  checkCoreVersion() {
    if (CORE_VERSION === this.NEED_CORE_VERSION) {
      return 0;
    }
    if (CORE_VERSION > this.NEED_CORE_VERSION) {
      return -1;
    }

    if (CORE_VERSION < this.NEED_CORE_VERSION) {
      return 1;
    }
  }
  initSQLite() {
    const SQLite = new this.Storage.SQLite(this.SQLITE_FILE);
    SQLite.createSimpleTable(this.DATABASE_ID);
    return SQLite;
  }
  getSql(key) {
    return this.SQLITE ? this.SQLITE.auto(this.DATABASE_ID, key) : undefined;
  }
  setSql(key, value) {
    return this.SQLITE.setSimpleData(this.DATABASE_ID, key, value);
  }
}

class CoreChecker {
  constructor(mod_dir) {
    this.MOD_DIR = mod_dir;
  }
  runMod(mod) {
    let fileName = `${this.MOD_DIR}${mod.FILE_NAME}`;
    if (!fileName.endsWith(".js")) {
      fileName += ".js";
    }
    if ($file.exists(fileName)) {
      if ($file.isDirectory(fileName)) {
        $ui.error("这是目录");
      } else {
        const coreMod = require(fileName),
          runMod = coreMod.run,
          _SUPPORT_COREJS_ = coreMod._SUPPORT_COREJS_;
        if (typeof runMod === "function" && _SUPPORT_COREJS_ === 1) {
          try {
            const runResult = runMod();
            if (runResult.success === true) {
              $console.info(`(core.js)Mod加载完毕:${mod.MOD_NAME}`);
            } else {
              $ui.alert({
                title: `Core.js加载[${mod.MOD_NAME}]失败(${runResult.code})`,
                message: runResult.error_message,
                actions: [
                  {
                    title: "OK",
                    disabled: false, // Optional
                    handler: function () {}
                  }
                ]
              });
            }
          } catch (error) {
            $ui.alert({
              title: `${mod.MOD_NAME}加载失败(catch)`,
              message: error.message,
              actions: [
                {
                  title: "OK",
                  disabled: false, // Optional
                  handler: function () {}
                }
              ]
            });
          }
        } else {
          $ui.alert({
            title: `该Mod不支持core.js`,
            message: "请用旧版加载模式",
            actions: [
              {
                title: "OK",
                disabled: false, // Optional
                handler: function () {
                  coreMod.init();
                }
              }
            ]
          });
        }
      }
    } else {
      $ui.error("不存在该文件");
    }
  }
  checkSupportCore(mod) {}
}
class ModInfo {
  constructor({ file, name, url, version, dec, pref, core }) {
    this.FILE_NAME = file;
    this.MOD_NAME = name;
    this.URL = url;
    this.VERSION = version;
    this.DEC = dec;
    this.PREF = pref;
    this.SUPPORT_CORE = core;
  }
}
module.exports = {
  __VERSION__: CORE_VERSION,
  Core,
  Result,
  CoreChecker,
  ModInfo,
  // <Core.js use guide>
  _SUPPORT_COREJS_: 1,
  run: () => {
    const _core = new Core();
    const ver = _core.checkCoreVersion();
    if (ver === 0) {
      _core.initView();
      return new _core.Result({
        success: true,
        code: 0
      });
    } else {
      return new _core.Result({
        success: false,
        code: 1,
        error_message: `need update core.js(${ver})`
      });
    }
  }
};
