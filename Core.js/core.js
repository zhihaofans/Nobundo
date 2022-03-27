const CORE_VERSION = 3,
  object = require("./object"),
  $ = require("./$");
class Core {
  constructor({
    kernel,
    modId,
    modName,
    version,
    author,
    needCoreVersion,
    ignoreCoreVersion
  }) {
    this.App = kernel.App;
    this.Kernel = kernel;
    this.Storage = require("./storage");
    this.Http = require("./lib").Http;
    this.$ = $;
    this.CORE_INFO = {
      ID: modId,
      NAME: modName,
      VERSION: version,
      AUTHOR: author,
      CORE_VERSION: needCoreVersion,
      DATABASE_ID: modId,
      IGNORE_CORE_VERSION: ignoreCoreVersion,
      KEYCHAIN_DOMAIN: `nobundo.mod.${author}.${modId}`
    };
    this.SQLITE_FILE = this.Kernel.DEFAULE_SQLITE_FILE || undefined;
    this.SQLITE =
      this.CORE_INFO.DATABASE_ID.length > 0 && this.Kernel.DEFAULE_SQLITE_FILE
        ? this.initSQLite()
        : undefined;
    this.Keychain = new this.Storage.Keychain(this.CORE_INFO.KEYCHAIN_DOMAIN);
  }
  checkCoreVersion() {
    if (CORE_VERSION === this.CORE_INFO.CORE_VERSION) {
      return 0;
    }
    if (CORE_VERSION > this.CORE_INFO.CORE_VERSION) {
      return -1;
    }

    if (CORE_VERSION < this.CORE_INFO.CORE_VERSION) {
      return 1;
    }
  }
  initSQLite() {
    const SQLite = new this.Storage.SQLite(this.SQLITE_FILE);
    SQLite.createSimpleTable(this.CORE_INFO.DATABASE_ID);
    return SQLite;
  }
  getSql(key) {
    return this.SQLITE
      ? this.SQLITE.auto(this.CORE_INFO.DATABASE_ID, key)
      : undefined;
  }
  setSql(key, value) {
    return this.SQLITE.setSimpleData(this.CORE_INFO.DATABASE_ID, key, value);
  }
}
class ModLoader {
  constructor({ modDir }) {
    this.MOD_DIR = modDir;
    this.modList = { id: [], mods: {} };
  }
  addMod(modCore) {
    if (typeof modCore.run == "function") {
      if (
        modCore.CORE_INFO.ID.length > 0 &&
        modCore.CORE_INFO.NAME.length > 0 &&
        modCore.CORE_INFO.AUTHOR.length > 0
      ) {
        const needUpdateCore = modCore.checkCoreVersion();
        if (
          modCore.CORE_INFO.IGNORE_CORE_VERSION == true ||
          needUpdateCore == 0
        ) {
        } else {
        }
      } else {
      }
    } else {
    }
  }
  addModByList(fileNameList) {
    fileNameList.map(fileName => this.addMod(require(fileName)));
  }
  getMod(modId) {
    return this.modList.mods[modId];
  }
  runMod(modId) {
    const thisMod = this.modList.mods[modId];
    try {
      thisMod.init();
    } catch (error) {
      $console.error(error);
      $ui.alert({
        title: `运行错误(${modId})`,
        message: error.message,
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    }
  }
}

module.exports = {
  __VERSION__: CORE_VERSION,
  Core,
  ModLoader
};
