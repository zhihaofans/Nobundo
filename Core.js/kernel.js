const __VERSION__ = 1,
  object = require("./object");
class Kernel {
  constructor({ app_name, use_sqlite = false, debug_mode = false }) {
    this.APP_NAME = app_name;
    this.DEBUG = debug_mode;
    this.REG_CORE_MOD_LIST = [];
    if (use_sqlite === true) {
      $file.mkdir("/assets/.files/");
      this.DEFAULE_SQLITE_FILE = "/assets/.files/mods.db";
    }
    if (this.isDebug()) {
      this.kernelDebug(`appname:${app_name}`);
      this.kernelDebug(`sqlite:${use_sqlite === true}`);
      this.kernelDebug(`debug:${debug_mode === true}`);
    }
  }
  isDebug() {
    this.DEBUG = this.DEBUG === true;
    return this.DEBUG === true;
  }
  kernelDebug(message) {
    if (this.isDebug()) {
      this.info("Kernel", message);
    } else {
      throw new object.UserException({
        name: "Forbidden",
        message: "need enable debug mode",
        source: "developer"
      });
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
      throw new object.UserException({
        name: "Bug",
        message: "register mod failed, ModCore.run  is not the function",
        source: "mod"
      });
    }
  }
  pushCoreModListView() {}
}
module.exports = {
  __VERSION__,
  Kernel
};
