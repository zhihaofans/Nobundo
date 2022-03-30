const { Kernel } = require("../Core.js/kernel"),
  { AppKernel } = require("../Core.js/app"),
  { ModLoader } = require("../Core.js/core"),
  ui = require("../Core.js/ui"),
  listKit = new ui.ListKit(),
  coreModList = [
    "bilibili.js",
    "jsbox-version.js",
    "wallhaven.js",
    "downloader.js",
    "reminder.js",
    "daoshuri.js",
    "free-api.js",
    "example.js",
    "mefang.js",
    "punches.js"
  ];

class KernelIndex extends Kernel {
  constructor({ app, appName, modDir, debug }) {
    super({
      appName,
      useSqlite: true,
      debug,
      modDir
    });
    this.App = app;
    this.DATA_DIR = app.DATA_DIR;
    this.info = app.info;
    this.error = app.error;
    this.warn = app.warn;
  }
  init() {
    this.loadCoreMods(this.MOD_DIR, coreModList);
    listKit.renderIdx(
      this.APP_NAME,
      this.REG_CORE_MOD_LIST.map(coreMod => coreMod.CORE_INFO.NAME),
      (section, row) => {
        this.REG_CORE_MOD_LIST[row].run();
      }
    );
  }
}
class App extends AppKernel {
  constructor({ appId, modDir, l10nPath }) {
    super({ appId, modDir, l10nPath });
    this.kernelIndex = new KernelIndex({
      app: this,
      appName: this.AppInfo.name,
      modDir: this.MOD_DIR,
      debug: this.DEBUG
    });
    this.modLoader = new ModLoader({ modDir, app: this });
  }
  init() {
    //this.kernelIndex.init();
    this.initModList();
    this.info(`启动耗时${new Date().getTime() - this.START_TIME}ms`);
  }
  initModList() {
    this.modLoader.addModByList(coreModList);
    listKit.renderIdx(
      this.AppInfo.name,
      this.modLoader.modList.id.map(
        modId => this.modLoader.modList.mods[modId].CORE_INFO.NAME
      ),
      (section, row) => {
        this.modLoader.runMod(this.modLoader.modList.id[row]);
      }
    );
  }
}
function run() {
  try {
    const app = new App({
      appId: "zhihaofans.nobundo",
      modDir: "/scripts/mods/",
      l10nPath: "/strings/l10n.js"
    });
    app.init();
  } catch (error) {
    $console.error(error);
    $ui.alert({
      title: "app.js throw",
      message: error,
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
module.exports = { run };
