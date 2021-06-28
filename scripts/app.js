const { Kernel } = require("../Core.js/kernel"),
  cctv = require("./mods/cctv"),
  bilibili = require("./mods/bilibili"),
  nandu = require("./mods/nandu"),
  ui = require("../Core.js/ui"),
  listKit = new ui.ListKit(),
  app_name = "Nobundo";
class AppKernel extends Kernel {
  constructor() {
    super({
      app_name,
      use_sqlite: true
    });
    this.l10n(require("../strings/l10n"));
    //this.DEFAULE_SQLITE_FILE = "/mods.db";
    // Register mods
    this.registerCoreMod(new cctv(this));
    this.registerCoreMod(new nandu(this));
    // this.registerCoreMod(new bilibili(this));
  }
  init() {
    listKit.renderString(
      app_name,
      this.REG_CORE_MOD_LIST.map(core_mod => core_mod.MOD_NAME),
      (sender, indexPath, data) => {
        this.REG_CORE_MOD_LIST[indexPath.row].run();
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
