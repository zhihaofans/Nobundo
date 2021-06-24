const __VERSION__ = 1;
class Kernel {
  constructor({ app_name, use_sqlite = false }) {
    this.APP_NAME = app_name;
    this.REG_CORE_MOD_LIST = [];
    if (use_sqlite) {
      $file.mkdir("/assets/.files/");
      this.DEFAULE_SQLITE_FILE = "/assets/.files/mods.db";
    }
  }
  // console
  info(id, msg) {
    const new_msg = msg ?? id,
      result = msg ? `${id}:${new_msg}` : new_msg;
    $console.info(result);
  }
  warn(id, msg) {
    const new_msg = msg ?? id,
      result = msg ? `${id}:${new_msg}` : new_msg;
    $console.warn(result);
  }
  error(id, msg) {
    const new_msg = msg ?? id,
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
      this.error("registerCoreMod", "ModCore.run ≠ function");
    }
  }
  pushCoreModListView() {}
}
module.exports = {
  __VERSION__,
  Kernel
};
