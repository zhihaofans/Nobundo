const CORE_VERSION = 6;
class ModCore {
  constructor({
    app,
    modId,
    modName,
    version,
    author,
    coreVersion,
    useSqlite
  }) {
    this.App = app;
    this.Storage = this.App.Storage;
    this.$ = this.App.$;
    this.Http = this.$.http;
    this.MOD_INFO = {
      ID: modId,
      NAME: modName,
      VERSION: version,
      AUTHOR: author,
      CORE_VERSION: coreVersion,
      DATABASE_ID: modId,
      KEYCHAIN_DOMAIN: `nobundo.mods.${author}.${modId}`,
      USE_SQLITE: useSqlite == true
    };
    this.SQLITE_FILE = this.App.DEFAULE_SQLITE_FILE;
    this.SQLITE =
      this.MOD_INFO.USE_SQLITE &&
      this.MOD_INFO.DATABASE_ID.length > 0 &&
      this.App.DEFAULE_SQLITE_FILE
        ? this.initSQLite()
        : undefined;
    this.Keychain = new this.Storage.Keychain(this.MOD_INFO.KEYCHAIN_DOMAIN);
  }
  checkCoreVersion() {
    if (CORE_VERSION === this.MOD_INFO.CORE_VERSION) {
      return 0;
    } else if (CORE_VERSION > this.MOD_INFO.CORE_VERSION) {
      return -1;
    } else if (CORE_VERSION < this.MOD_INFO.CORE_VERSION) {
      return 1;
    }
  }
  initSQLite() {
    const SQLite = new this.Storage.SQLite(this.SQLITE_FILE);
    SQLite.createSimpleTable(this.MOD_INFO.DATABASE_ID);
    return SQLite;
  }
}
class ModLoader {
  constructor({ app, modDir }) {
    this.App = app;
    this.$ = this.App.$;
    this.MOD_DIR = modDir;
    this.MOD_LIST = { id: [], mods: {} };
    this.CONFIG = {
      CONTEXT_MOD_ID: undefined,
      KEYBOARD_MOD_ID: undefined,
      WIDGET_MOD_ID: undefined
    };
  }
  addMod(modCore) {
    if (
      this.$.isFunction(modCore.run) ||
      this.$.isFunction(modCore.runWidget) ||
      this.$.isFunction(modCore.runContext) ||
      this.$.isFunction(modCore.runKeyboard)
    ) {
      if (
        modCore.MOD_INFO.ID.length > 0 &&
        modCore.MOD_INFO.NAME.length > 0 &&
        modCore.MOD_INFO.AUTHOR.length > 0
      ) {
        const needUpdateCore = modCore.checkCoreVersion();
        if (needUpdateCore == 0) {
          const modId = modCore.MOD_INFO.ID;
          if (
            this.MOD_LIST.id.indexOf(modId) < 0 &&
            this.MOD_LIST.mods[modId] == undefined
          ) {
            this.MOD_LIST.id.push(modId);
            this.MOD_LIST.mods[modId] = modCore;
          } else {
            $console.error(`modId(${modId})已存在`);
          }
        } else {
          $console.error({ modId: modCore.MOD_INFO.ID, needUpdateCore });
          const modId = modCore.MOD_INFO.ID;
          if (
            this.MOD_LIST.id.indexOf(modId) < 0 &&
            this.MOD_LIST.mods[modId] == undefined
          ) {
            this.MOD_LIST.id.push(modId);
            this.MOD_LIST.mods[modId] = modCore;
          } else {
            $console.error(`modId(${modId})已存在`);
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
  getModList() {
    return this.MOD_LIST;
  }
  getMod(modId) {
    return this.MOD_LIST.mods[modId];
  }
  runMod(modId) {
    const thisMod = this.MOD_LIST.mods[modId];
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
      this.MOD_LIST.id.indexOf(modId) >= 0 &&
      this.$.isFunction(this.MOD_LIST.mods[modId].runWidget)
    ) {
      this.CONFIG.WIDGET_MOD_ID = modId;
    }
  }
  runWidgetMod() {
    const thisMod = this.MOD_LIST.mods[this.CONFIG.WIDGET_MOD_ID];
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
  setContextMod(modId) {
    if (
      this.MOD_LIST.id.indexOf(modId) >= 0 &&
      this.$.isFunction(this.MOD_LIST.mods[modId].runContext)
    ) {
      this.ACTION_MOD_ID = modId;
      this.CONFIG.CONTEXT_MOD_ID = modId;
    }
  }
  runContextMod() {
    const modId = this.CONFIG.CONTEXT_MOD_ID;
    if (modId && modId.length >= 0) {
      const thisMod = this.MOD_LIST.mods[modId];
      try {
        thisMod.runContext();
      } catch (error) {
        $console.error(error);
      }
    } else {
      $app.close();
    }
  }
  isModSupportApi(modId) {
    if (modId && modId.length >= 0) {
      const thisMod = this.MOD_LIST.mods[modId];
      return thisMod != undefined && this.$.isFunction(thisMod.runApi);
    }
    return false;
  }
  runModApi(modId, apiId, data) {
    if (modId && modId.length >= 0) {
      const thisMod = this.MOD_LIST.mods[modId];
      if (thisMod != undefined && this.$.isFunction(thisMod.runApi)) {
        try {
          return thisMod.runApi(apiId, data);
        } catch (error) {
          $console.error(error);
          return false;
        }
      } else {
        $console.error({
          func: "runCoreApi",
          message: "need coreId"
        });
        return false;
      }
    } else {
      $console.error({
        func: "runCoreApi",
        message: "need coreId"
      });
      return false;
    }
  }
  setKeyboardMod(modId) {
    if (
      this.MOD_LIST.id.indexOf(modId) >= 0 &&
      this.$.isFunction(this.MOD_LIST.mods[modId].runKeyboard)
    ) {
      this.CONFIG.KEYBOARD_MOD_ID = modId;
    }
  }
  runKeyboardMod() {
    const modId = this.CONFIG.CONTEXT_MOD_ID;
    if (modId && modId.length >= 0) {
      const thisMod = this.MOD_LIST.mods[modId];
      try {
        thisMod.runKeyboard();
      } catch (error) {
        $console.error(error);
        $ui.alert({
          title: "runKeyboardMod.error",
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
    } else {
      $app.close();
    }
  }
  autoRunMod() {
    switch (true) {
      case this.App.isWidgetEnv():
        this.runWidgetMod();
        break;
      case this.App.isAppEnv():
        $ui.render({
          props: {
            title: this.App.AppInfo.name
          },
          views: [
            {
              type: "list",
              props: {
                data: this.getModList().id.map(modId => {
                  const thisMod = this.getModList().mods[modId];
                  if (thisMod.checkCoreVersion() == 0) {
                    return thisMod.MOD_INFO.NAME;
                  } else {
                    return thisMod.MOD_INFO.NAME + "(待更新)";
                  }
                })
              },
              layout: $layout.fill,
              events: {
                didSelect: (sender, indexPath, data) => {
                  this.runMod(this.getModList().id[indexPath.row]);
                }
              }
            }
          ]
        });
        break;
      case this.App.isActionEnv() || this.App.isSafariEnv():
        this.runContextMod();
        break;
      case this.App.isKeyboardEnv():
        this.runKeyboardMod();
        break;
      default:
        $app.close();
    }
  }
}
class ModModule {
  constructor({ modId, coreId, moduleId, moduleName, author, version }) {
    this.CORE_ID = modId || coreId;
    this.MOD_ID = modId;
    this.MODULE_ID = moduleId;
    this.MODULE_NAME = moduleName;
    this.AUTHOR = author;
    this.VERSION = version;
  }
}
class ModModuleLoader {
  constructor(mod) {
    this.Mod = mod;
    this.App = this.Mod.App;
    this.MOD_DIR = this.App.MOD_DIR;
    this.ModuleList = {};
  }
  addModule(fileName) {
    if (fileName.length <= 0) {
      $console.error({
        name: "core.module.ModuleLoader.addModule",
        MOD_NAME: this.Mod.MOD_INFO.NAME,
        message: "需要module fileName",
        fileName,
        length: fileName.length
      });
      return false;
    }
    const modulePath = this.MOD_DIR + fileName;
    if (this.Mod.MOD_INFO.ID.length <= 0) {
      $console.error({
        name: "core.module.ModuleLoader.addModule",
        message: "需要Mod.MOD_INFO.ID",
        MOD_NAME: this.Mod.MOD_INFO.NAME
      });
      return false;
    }
    if (!$file.exists(modulePath) || $file.isDirectory(modulePath)) {
      $console.error({
        name: "core.module.ModuleLoader.addModule",
        message: "module文件不存在",
        MOD_NAME: this.Mod.MOD_INFO.NAME,
        fileName
      });
      return false;
    }
    try {
      const moduleFile = require(modulePath),
        thisModule = new moduleFile(this.Mod);
      if (this.Mod.MOD_INFO.ID != thisModule.MOD_ID) {
        $console.error({
          name: "core.module.ModuleLoader.addModule",
          message: "CORE_ID错误",
          MOD_NAME: this.Mod.MOD_INFO.NAME,
          CORE_ID: thisModule.MOD_ID,
          MOD_ID: this.Mod.MOD_INFO.ID,
          MODULE_ID: thisModule.MODULE_ID,
          MODULE_NAME: thisModule.MODULE_NAME
        });
        return false;
      }
      if (thisModule.AUTHOR == undefined || thisModule.AUTHOR.length <= 0) {
        thisModule.AUTHOR = this.Mod.MOD_INFO.AUTHOR;
        $console.info(
          `自动为模块${thisModule.MOD_ID}添加mod的作者(${this.Mod.MOD_INFO.AUTHOR})`
        );
      }
      this.ModuleList[thisModule.MODULE_ID] = thisModule;
      $console.info(
        `Mod[${this.Mod.MOD_INFO.NAME}]加载module[${thisModule.MODULE_NAME}]`
      );
      return true;
    } catch (error) {
      $console.error({
        id: "core.module.ModuleLoader.addModule.try",
        fileName,
        MOD_NAME: this.Mod.MOD_INFO.NAME,
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
  Core: ModCore,
  CoreLoader: ModLoader,
  CoreModule: ModModule,
  ModuleLoader: ModModuleLoader,
  ModCore,
  ModLoader,
  ModModule,
  ModModuleLoader
};
