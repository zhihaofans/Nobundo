const __VERSION__ = 1,
  { CoreChecker } = require("./core");
class Kernel {
  constructor(app_name) {
    this.APP_NAME = app_name;
    this.REG_CORE_MOD_LIST = [];
  }
  error(id, msg) {
    let new_msg = msg ?? id,
      result = "";
    switch (typeof new_msg) {
      case "object":
        //new_msg = JSON.stringify(new_msg);
        break;
    }
    result = msg ? `${id}:${new_msg}` : new_msg;
    $console.error(result);
  }
  l10n(l10nRes) {
    const result = {};
    Object.keys(l10nRes).map(key => {
      const thisItem = l10nRes[key];
      Object.keys(thisItem).map(lang => {
        if (!result[lang]) {
          result[lang] = {};
        }
        result[lang][key] = thisItem[lang];
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
