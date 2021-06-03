const __VERSION__ = 1,
  { CoreChecker } = require("./core");
class Kernel {
  constructor(name) {
    this.NAME = name;
    this.REG_CORE_MOD_LIST = [];
  }
  errorLog(id, msg) {
    $console.error(`${id}:${msg}`);
  }
  l10n(l10nRes) {
    const result = {};
    Object.keys(l10nRes).map(k => {
      const thisItem = l10nRes[k];
      Object.keys(thisItem).map(_k => {
        if (!result[_k]) {
          result[_k] = {};
        }
        result[_k][k] = thisItem[_k];
      });
    });
    $app.strings = result;
  }
  registerCoreMod(ModCore) {
    if (typeof ModCore.run === "function") {
      this.REG_CORE_MOD_LIST.push(ModCore);
    } else {
      this.errorLog("registerCoreMod", "ModCore.run ≠ function");
    }
  }
  pushCoreModListView() {}
}
module.exports = {
  __VERSION__,
  Kernel
};
