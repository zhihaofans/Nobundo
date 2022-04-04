const CORE_VERSION = 3,
  $ = require("./$");
class Core {
  constructor({
    app,
    modId,
    modName,
    version,
    author,
    needCoreVersion,
    ignoreCoreVersion
  }) {
    this.App = app;
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
      KEYCHAIN_DOMAIN: `nobundo.mods.${author}.${modId}`
    };
    this.SQLITE_FILE = this.App.DEFAULE_SQLITE_FILE;
    this.SQLITE =
      this.CORE_INFO.DATABASE_ID.length > 0 && this.App.DEFAULE_SQLITE_FILE
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
  constructor({ app, modDir }) {
    this.App = app;
    this.MOD_DIR = modDir;
    this.modList = { id: [], mods: {} };
    this.WIDGET_MOD_ID = undefined;
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
          const modID = modCore.CORE_INFO.ID;
          if (
            this.modList.id.indexOf(modID) < 0 &&
            this.modList.mods[modID] == undefined
          ) {
            this.modList.id.push(modID);
            this.modList.mods[modID] = modCore;
          } else {
            $console.error(`modID(${modID})已存在`);
          }
        } else {
          $console.error({ needUpdateCore });
        }
      } else {
        $console.error(3);
      }
    } else {
      $console.error(4);
    }
  }
  addModByList(fileNameList) {
    fileNameList.map(fileName => {
      try {
        const thisMod = require(this.MOD_DIR + fileName);
        this.addMod(new thisMod(this.App));
      } catch (error) {
        $console.error({
          message: error.message,
          fileName,
          name: "ModLoader.addModByList"
        });
      }
    });
  }
  getMod(modId) {
    return this.modList.mods[modId];
  }
  runMod(modId) {
    const thisMod = this.modList.mods[modId];
    $console.warn(thisMod);
    try {
      thisMod.run();
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
  setWidgetMod(modId) {
    if (
      this.modList.id.indexOf(modId) >= 0 &&
      typeof this.modList.mods[modId].runWidget == "function"
    ) {
      this.WIDGET_MOD_ID = modId;
      this.App.WIDGET_MOD_ID = modId;
    }
  }
  runWidgetMod() {
    const modId = this.WIDGET_MOD_ID,
      thisMod = this.modList.mods[modId];
    $console.warn(thisMod);
    try {
      thisMod.runWidget();
    } catch (error) {
      $console.error(error);
      $widget.setTimeline({
        render: ctx => {
          return {
            type: "text",
            props: {
              text: error.message
            }
          };
        }
      });
    }
  }
}

module.exports = {
  __VERSION__: CORE_VERSION,
  Core,
  ModLoader
};
