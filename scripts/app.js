const { Kernel } = require("../Core.js/kernel"),
  mods = {
    bilibili: require("./mods/bilibili"),
    nandu: require("./mods/nandu"),
    version: require("./mods/jsbox-version"),
    wallhaven: require("./mods/wallhaven"),
    downloader: require("./mods/downloader")
    //    reminder: require("./mods/reminder"),
    //    daoshuri: require("./mods/daoshuri")
  },
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
    this.l10n(require("../strings/l10n"));
    //this.DEFAULE_SQLITE_FILE = "/mods.db";
    // Register mods
    this.registerCoreMod(new mods.nandu(this));
    this.registerCoreMod(new mods.bilibili(this));
    this.registerCoreMod(new mods.version(this));
    this.registerCoreMod(new mods.wallhaven(this));
    this.registerCoreMod(new mods.downloader(this));
    //    this.registerCoreMod(new mods.reminder(this));
    //    this.registerCoreMod(new mods.daoshuri(this));
    this.loadCoreMods("/scripts/mods/", ["reminder.js", "daoshuri.js"]);
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
