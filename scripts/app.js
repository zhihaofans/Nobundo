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
    "mefang.js"
  ];

class KernelIndex extends Kernel {
  constructor({ appName, modDir }) {
    super({
      appName,
      useSqlite: true,
      debug: true,
      modDir
    });
    // 注册mod
    this.loadCoreMods(this.MOD_DIR, coreModList);
  }
  init() {
    listKit.renderIdx(
      this.APP_NAME,
      this.REG_CORE_MOD_LIST.map(coreMod => coreMod.MOD_NAME),
      (section, row) => {
        this.REG_CORE_MOD_LIST[row].run();
      }
    );
  }
}
class App extends AppKernel {
  constructor({ appId, modDir, l10nPath }) {
    super({ appId, modDir, l10nPath });
    this.setLocalDataDir("/.data/local_data/");
    this;
    this.modLoader = new ModLoader({ modDir });
    this.kernelIndex = new KernelIndex({
      appName: this.AppInfo.name,
      modDir: this.MOD_DIR
    });
    //this.modLoader.addModByList(coreModList);
  }
  init() {
    this.kernelIndex.init();
    $console.info(`启动耗时${new Date().getTime() - this.START_TIME}ms`);
  }
  initModList() {
    listKit.renderIdx(
      this.APP_NAME,
      this.modLoader.modList.mods.map(coreMod => coreMod.MOD_NAME),
      (section, row) => {
        this.modLoader.runMod(this.modLoader.modList[row].CORE_INFO.ID);
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
  } catch (_error) {
    $console.error(_error);
  }
}
module.exports = { run };
