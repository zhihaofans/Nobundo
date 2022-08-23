const CORE_VERSION = 7;
class ModCore {
  constructor({
    app,
    modId,
    modName,
    icon,
    image,
    version,
    author,
    coreVersion,
    useSqlite
  }) {
    this.App = app;
    this.MOD_INFO = {
      ID: modId,
      NAME: modName,
      VERSION: version,
      AUTHOR: author,
      CORE_VERSION: coreVersion,
      DATABASE_ID: modId,
      KEYCHAIN_DOMAIN: `nobundo.mods.${author}.${modId}`,
      USE_SQLITE: useSqlite == true,
      ICON: icon,
      IMAGE: image,
      NEED_UPDATE: coreVersion != CORE_VERSION
    };
    this.SQLITE_FILE = app.DEFAULE_SQLITE_FILE;
    this.SQLITE =
      this.MOD_INFO.USE_SQLITE &&
      this.MOD_INFO.DATABASE_ID.length > 0 &&
      app.DEFAULE_SQLITE_FILE
        ? this.initSQLite()
        : undefined;
    this.Keychain = new app.Storage.Keychain(this.MOD_INFO.KEYCHAIN_DOMAIN);
  }
  initSQLite() {
    const SQLite = new this.App.Storage.ModSQLite(
      this.SQLITE_FILE,
      this.MOD_INFO.DATABASE_ID
    );
    SQLite.createTable();
    return SQLite;
  }
}
class ModLoader {
  constructor({ app, modDir, gridListMode = false }) {
    this.App = app;
    this.$ = app.$;
    this.MOD_DIR = modDir;
    this.MOD_LIST = { id: [], mods: {} };
    this.CONFIG = {
      CONTEXT_MOD_ID: undefined,
      KEYBOARD_MOD_ID: undefined,
      WIDGET_MOD_ID: undefined,
      GRID_LIST_MODE: gridListMode == true
    };
  }
  addMod(modCore) {
    if (
      this.$.isFunction(modCore.run) ||
      this.$.isFunction(modCore.runWidget) ||
      this.$.isFunction(modCore.runContext) ||
      this.$.isFunction(modCore.runKeyboard) ||
      this.$.isFunction(modCore.runApi)
    ) {
      if (
        modCore.MOD_INFO.ID.length > 0 &&
        modCore.MOD_INFO.NAME.length > 0 &&
        modCore.MOD_INFO.AUTHOR.length > 0
      ) {
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
          name: "ModLoader.addCoreByList"
        });
      }
    });
  }
  addModsByList(fileNameList) {
    fileNameList.map(fileName => {
      try {
        const thisMod = require(this.MOD_DIR + fileName);
        this.addMod(new thisMod(this.App));
      } catch (error) {
        $console.error({
          message: error.message,
          fileName,
          name: "ModLoader.addModsByList"
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
  runModApi({ modId, apiId, data }) {
    $console.info({
      modId,
      apiId,
      data
    });
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
          func: "runModApi",
          message: "need mod"
        });
        return false;
      }
    } else {
      $console.error({
        func: "runModApi",
        message: "need mod id"
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
    const modId = this.CONFIG.KEYBOARD_MOD_ID;
    if (modId && modId.length >= 0) {
      const thisMod = this.MOD_LIST.mods[modId];
      try {
        thisMod.runKeyboard();
      } catch (error) {
        $console.error(error);
        $ui.render({
          props: {
            title: "初始化错误"
          },
          views: [
            {
              type: "list",
              props: {
                data: [
                  {
                    title: "错误原因",
                    rows: [error.message]
                  }
                ]
              },
              layout: $layout.fill,
              events: {
                didSelect: (_sender, indexPath, _data) => {
                  const row = indexPath.row;
                }
              }
            }
          ]
        });
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
      //      $app.close();
      $ui.render({
        props: {
          title: "初始化错误"
        },
        views: [
          {
            type: "list",
            props: {
              data: [
                {
                  title: "错误原因",
                  rows: ["未设置modId"]
                }
              ]
            },
            layout: $layout.fill,
            events: {
              didSelect: (_sender, indexPath, _data) => {
                const row = indexPath.row;
              }
            }
          }
        ]
      });
    }
  }
  autoRunMod() {
    switch (true) {
      case this.App.isWidgetEnv():
        this.runWidgetMod();
        break;
      case this.App.isAppEnv():
        if (this.CONFIG.GRID_LIST_MODE) {
          this.showGridModList();
        } else {
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
                    if (thisMod.MOD_INFO.NEED_UPDATE) {
                      return thisMod.MOD_INFO.NAME + "(待更新)";
                    } else {
                      return thisMod.MOD_INFO.NAME;
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
        }
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
  showGridModList() {
    const modList = this.getModList();
    $ui.render({
      props: {
        title: this.App.AppInfo.name
      },
      views: [
        {
          type: "matrix",
          props: {
            columns: 3,
            waterfall: true,
            itemHeight: 50,
            spacing: 2,
            template: {
              props: {},
              views: [
                {
                  type: "stack",
                  props: {
                    axis: $stackViewAxis.vertical,
                    spacing: 5,
                    distribution: $stackViewDistribution.fillProportionally,
                    stack: {
                      views: [
                        {
                          type: "image",
                          props: {
                            id: "image"
                          },
                          layout: (make, view) => {
                            make.center.equalTo(view.super);
                            make.size.equalTo($size(50, 50));
                          }
                        },
                        {
                          type: "label",
                          props: {
                            id: "name",

                            align: $align.left,
                            font: $font(12)
                          },
                          layout: make => {
                            make.height.equalTo(20);
                            make.left.top.right.inset(0);
                          }
                        }
                      ]
                    }
                  },
                  layout: $layout.fill
                }
              ]
            },
            data: modList.id.map(modId => {
              const mod = modList.mods[modId];
              return {
                image: {
                  icon: mod.MOD_INFO.ICON,
                  image: mod.MOD_INFO.IMAGE
                },
                name: {
                  text: mod.MOD_INFO.NAME
                }
              };
            })
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              this.runMod(modList.id[indexPath.row]);
            }
          }
        }
      ]
    });
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
