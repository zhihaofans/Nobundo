const { Kernel } = require("../Core.js/kernel"),
  ui = require("../Core.js/ui"),
  listKit = new ui.ListKit(),
  appName = "Nobundo";
class AppKernel extends Kernel {
  constructor() {
    super({
      appName,
      useSqlite: true,
      debug: true
    });
    // 加载多语言
    this.l10n(require("../strings/l10n"));
    //this.DEFAULE_SQLITE_FILE = "/mods.db";
    // 注册mod
    const coreModList = [
      "nandu.js",
      "bilibili.js",
      "jsbox-version.js",
      "wallhaven.js",
      "downloader.js",
      "reminder.js",
      "daoshuri.js"
    ];
    this.loadCoreMods("/scripts/mods/", coreModList);
  }
  init() {
    listKit.renderIdx(
      appName,
      this.REG_CORE_MOD_LIST.map(coreMod => coreMod.MOD_NAME),
      (section, row) => {
        this.REG_CORE_MOD_LIST[row].run();
      }
    );
  }
}
const run = () => {
  try {
    const app = new AppKernel();
    app.init();
  } catch (_error) {
    $console.error(_error);
  }
};
module.exports = { run };
