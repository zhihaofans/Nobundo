const { Kernel } = require("../Core.js/kernel"),
  cctv = require("./mods/cctv"),
  ui = require("../Core.js/ui"),
  listKit = new ui.ListKit();
const app_name = "Nobundo";
class AppKernel extends Kernel {
  constructor() {
    super(app_name);
    this.l10n(require("../strings/l10n"));
    // Register mods
    this.registerCoreMod(new cctv(this));
  }
  init() {
    this.error(this.REG_CORE_MOD_LIST.map(core_mod => core_mod.MOD_NAME));
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
  const app = new AppKernel();
  app.init();
};
module.exports = { run };
