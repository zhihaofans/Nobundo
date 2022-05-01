const CORE_VERSION = 5,
  $ = require("./$");
class Core {
  constructor({
    app,
    modId,
    modName,
    version,
    author,
    needCoreVersion,
    ignoreCoreVersion,
    coreVersion
  }) {
    this.App = app;
    this.Storage = require("./storage");
    this.Http = $.http;
    this.$ = $;
    this.CORE_INFO = {
      ID: modId,
      NAME: modName,
      VERSION: version,
      AUTHOR: author,
      CORE_VERSION: coreVersion || needCoreVersion,
      DATABASE_ID: modId,
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
class CoreLoader {
  constructor({ app, modDir }) {
    this.App = app;
    this.MOD_DIR = modDir;
    this.modList = { id: [], mods: {} };
    this.WIDGET_MOD_ID = undefined;
    this.ACTION_MOD_ID = undefined;
  }
  addCore(modCore) {
    if (
      typeof modCore.run == "function" ||
      typeof modCore.runWidget == "function" ||
      typeof modCore.runContext == "function"
    ) {
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
        }
      } else {
        $console.error(3);
      }
    } else {
      $console.error(4);
    }
  }
  addCoreByList(fileNameList) {
    fileNameList.map(fileName => {
      try {
        const thisMod = require(this.MOD_DIR + fileName);
        this.addCore(new thisMod(this.App));
      } catch (error) {
        $console.error({
          message: error.message,
          fileName,
          name: "ModLoader.addModByList"
        });
      }
    });
  }
  getCore(modId) {
    return this.modList.mods[modId];
  }
  runCore(modId) {
    const thisMod = this.modList.mods[modId];
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
  setWidgetCore(modId) {
    if (
      this.modList.id.indexOf(modId) >= 0 &&
      typeof this.modList.mods[modId].runWidget == "function"
    ) {
      this.WIDGET_MOD_ID = modId;
    }
  }
  runWidgetCore() {
    const modId = this.WIDGET_MOD_ID,
      thisMod = this.modList.mods[modId];
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
  setActionCore(coreId) {
    if (
      this.modList.id.indexOf(coreId) >= 0 &&
      typeof this.modList.mods[coreId].runContext == "function"
    ) {
      this.ACTION_MOD_ID = coreId;
    }
  }
  runActionCore() {
    const coreId = this.ACTION_MOD_ID;
    if (coreId && coreId.length >= 0) {
      const thisCore = this.modList.mods[coreId];
      try {
        thisCore.runContext();
      } catch (error) {
        $console.error(error);
      }
    } else {
      $app.close();
    }
  }
}
class CoreModule {
  constructor({ coreId, moduleId, moduleName, author, version }) {
    this.CORE_ID = coreId;
    this.MODULE_ID = moduleId;
    this.MODULE_NAME = moduleName;
    this.AUTHOR = author;
    this.VERSION = version;
  }
}
class ModuleLoader {
  constructor(core) {
    this.Core = core;
    this.App = core.App;
    this.MOD_DIR = this.App.MOD_DIR;
    this.ModuleList = {};
  }
  addModule(fileName) {
    if (fileName.length <= 0) {
      $console.error({
        name: "core.module.ModuleLoader.addModule",
        MOD_NAME: this.Core.CORE_INFO.NAME,
        message: "需要module fileName",
        fileName,
        length: fileName.length
      });
      return false;
    }
    const modulePath = this.MOD_DIR + fileName;
    if (this.Core.CORE_INFO.ID.length <= 0) {
      $console.error({
        name: "core.module.ModuleLoader.addModule",
        message: "需要Core.MOD_ID",
        MOD_NAME: this.Core.CORE_INFO.NAME
      });
      return false;
    }
    if (!$file.exists(modulePath) || $file.isDirectory(modulePath)) {
      $console.error({
        name: "core.module.ModuleLoader.addModule",
        message: "module文件不存在",
        MOD_NAME: this.Core.CORE_INFO.NAME,
        fileName
      });
      return false;
    }
    try {
      const moduleFile = require(modulePath),
        thisModule = new moduleFile(this.Core);
      if (this.Core.CORE_INFO.ID != thisModule.CORE_ID) {
        $console.error({
          name: "core.module.ModuleLoader.addModule",
          message: "CORE_ID错误",
          MOD_NAME: this.Core.CORE_INFO.NAME,
          CORE_ID: thisModule.CORE_ID,
          MOD_ID: this.Core.CORE_INFO.ID,
          MODULE_ID: thisModule.MODULE_ID,
          MODULE_NAME: thisModule.MODULE_NAME
        });
        return false;
      }
      if ((thisModule.AUTHOR = undefined || thisModule.AUTHOR.length <= 0)) {
        thisModule.AUTHOR = this.Core.CORE_INFO.AUTHOR;
      }
      this.ModuleList[thisModule.MODULE_ID] = thisModule;
      $console.info(
        `Mod[${this.Core.CORE_INFO.NAME}]加载module[${thisModule.MODULE_NAME}]`
      );
      return true;
    } catch (error) {
      $console.error({
        id: "core.module.ModuleLoader.addModule.try",
        fileName,
        MOD_NAME: this.Core.CORE_INFO.NAME,
        error: error.message
      });
      return false;
    }
  }
  getModule(moduleId) {
    return this.ModuleList[moduleId];
  }
}

module.exports = {
  __VERSION__: CORE_VERSION,
  Core,
  CoreLoader,
  CoreModule,
  ModuleLoader
};
