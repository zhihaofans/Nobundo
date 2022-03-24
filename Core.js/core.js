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
    databaseId,
    needCoreVersion,
    keychainId,
    ignoreCoreVersion
  }) {
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
    this.MOD_ID = this.CORE_INFO.ID;
    this.MOD_NAME = this.CORE_INFO.NAME || "core";
    this.MOD_VERSION = this.CORE_INFO.VERSION || 1;
    this.MOD_AUTHOR = this.CORE_INFO.AUTHOR || "zhihaofans";
    this.NEED_CORE_VERSION = this.CORE_INFO.CORE_VERSION || 0;
    this.DATABASE_ID = this.CORE_INFO.DATABASE_ID;
    this.SQLITE_FILE = this.Kernel.DEFAULE_SQLITE_FILE || undefined;
    this.SQLITE =
      this.DATABASE_ID.length > 0 && this.Kernel.DEFAULE_SQLITE_FILE
        ? this.initSQLite()
        : undefined;
    this.KEYCHAIN_DOMAIN = this.CORE_INFO.KEYCHAIN_DOMAIN;
    this.Keychain = new this.Storage.Keychain(this.CORE_INFO.KEYCHAIN_DOMAIN);
    this.IGNORE_CORE_VERSION = ignoreCoreVersion === true;
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
class ModLoader {
  constructor({ modDir }) {
    this.MOD_DIR = modDir;
    this.modList = { id: [], mods: {} };
  }
  addMod(fileName) {
    const filePath = this.MOD_DIR + fileName;
    if (fileName.length > 0 && $.file.isFileExist(filePath)) {
      const thisMod = require(filePath),
        modId = thisMod.CORE_INFO.ID;
      if (this.modList.id.indexOf(modId) < 0) {
        this.modList.id.push(modId);
        this.modList.mods[modId] = thisMod;
        if (typeof modCore.run === "function") {
          const needUpdateCore = modCore.checkCoreVersion();
          if (modCore.MOD_ID.length <= 0) {
            throw new object.UserException({
              name: "Mod id",
              message: "need mod id",
              source: "mod"
            });
          } else if (modCore.MOD_NAME.length <= 0) {
            throw new object.UserException({
              name: "Mod name",
              message: "need mod name",
              source: "mod"
            });
          } else if (
            modCore.IGNORE_CORE_VERSION == true ||
            needUpdateCore == 0
          ) {
            this.REG_CORE_MOD_LIST.push(modCore);
          } else {
            this.error("registerCoreMod", "need update mod");
            $ui.alert({
              title: "registerCoreMod",
              message: `need update mod(${needUpdateCore},${modCore.MOD_NAME})`,
              actions: [
                {
                  title: "OK",
                  disabled: false, // Optional
                  handler: () => {}
                }
              ]
            });
            throw new object.UserException({
              name: "Mod version",
              message: "register mod failed, need update mod or core.js",
              source: "mod"
            });
          }
        } else {
          this.error("registerCoreMod", "ModCore.run ≠ function");
          throw new object.UserException({
            name: "Bug",
            message: "register mod failed, ModCore.run  is not the function",
            source: "mod"
          });
        }
      } else {
        throw new object.UserException({
          name: "重复",
          message: "重复添加mod",
          source: "developer"
        });
      }
    } else {
      throw new object.UserException({
        name: "404",
        message: "找不到该mod",
        source: "developer"
      });
    }
  }
  addModByList(fileNameList) {
    fileNameList.map(name => this.addMod(name));
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
