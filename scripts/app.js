const { Kernel } = require("../Core.js/kernel"),
  cctv = require("./mods/cctv"),
  bilibili = require("./mods/bilibili"),
  nandu = require("./mods/nandu"),
  haobuye = require("./mods/haobuye"),
  ui = require("../Core.js/ui"),
  listKit = new ui.ListKit(),
  app_name = "Nobundo";
class AppKernel extends Kernel {
  constructor() {
    super({
      app_name,
      use_sqlite: true,
      debug: true
    });
    this.l10n(require("../strings/l10n"));
    //this.DEFAULE_SQLITE_FILE = "/mods.db";
    // Register mods
    this.registerCoreMod(new cctv(this));
    this.registerCoreMod(new nandu(this));
    this.registerCoreMod(new bilibili(this));
    this.registerCoreMod(new haobuye(this));
  }
  init() {
    listKit.renderIdx(
      app_name,
      this.REG_CORE_MOD_LIST.map(core_mod => core_mod.MOD_NAME),
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
