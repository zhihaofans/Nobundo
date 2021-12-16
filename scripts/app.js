const { Kernel } = require("../Core.js/kernel"),
  bilibili = require("./mods/bilibili"),
  nandu = require("./mods/nandu"),
  version = require("./mods/jsbox-version"),
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
    this.registerCoreMod(new nandu(this));
    this.registerCoreMod(new bilibili(this));
    this.registerCoreMod(new version(this));
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
