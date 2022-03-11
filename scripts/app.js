const { Kernel } = require("../Core.js/kernel"),
  { AppKernel } = require("../Core.js/app"),
  ui = require("../Core.js/ui"),
  listKit = new ui.ListKit();

class KernelIndex extends Kernel {
  constructor({ appName, modDir }) {
    super({
      appName,
      useSqlite: true,
      debug: true,
      modDir
    });
    // 注册mod
    const coreModList = [
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
  }
  init() {
    const kernelIndex = new KernelIndex({
      appName: this.AppInfo.name,
      modDir: this.MOD_DIR
    });
    kernelIndex.init();
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
