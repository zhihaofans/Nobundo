const __VERSION__ = 3,
  object = require("./object");
class Kernel {
  constructor({ appName, useSqlite = false, debug, modDir }) {
    this.APP_NAME = appName;
    this.DEBUG = debug == true;
    this.USE_SQLITR = useSqlite;
    this.REG_CORE_MOD_LIST = [];
    if (useSqlite === true) {
      $file.mkdir("/assets/.files/");
      this.DEFAULE_SQLITE_FILE = "/assets/.files/mods.db";
    }
    this.MOD_DIR = modDir;
  }
  kernelDebug(message) {
    if (this.DEBUG) {
      $console.info(`Kernel:${message}`);
    }
  }
  registerCoreMod(modCore) {
    if (typeof modCore.run === "function") {
      const needUpdateCore = modCore.checkCoreVersion();
      if (modCore.CORE_INFO.ID.length <= 0) {
        throw new object.UserException({
          name: "Mod id",
          message: "need mod id",
          source: "mod"
        });
      } else if (modCore.CORE_INFO.NAME.length <= 0) {
        throw new object.UserException({
          name: "Mod name",
          message: "need mod name",
          source: "mod"
        });
      } else if (
        modCore.CORE_INFO.IGNORE_CORE_VERSION == true ||
        needUpdateCore == 0
      ) {
        this.REG_CORE_MOD_LIST.push(modCore);
      } else {
        this.error("registerCoreMod", "need update mod");
        $ui.alert({
          title: "registerCoreMod",
          message: `need update mod(${needUpdateCore},${modCore.CORE_INFO.NAME})`,
          actions: [
            {
              title: "OK",
              disabled: false, // Optional
              handler: () => {}
            }
          ]
        });
        throw new object.UserException({
          name: "Mod version",
          message: "register mod failed, need update mod or core.js",
          source: "mod"
        });
      }
    } else {
      this.error("registerCoreMod", "ModCore.run ≠ function");
      throw new object.UserException({
        name: "Bug",
        message: "register mod failed, ModCore.run  is not the function",
        source: "mod"
      });
    }
  }
  loadCoreMods(modDir, modList) {
    modList.map(mod => {
      try {
        const modPath = modDir + mod,
          thisMod = require(modPath);
        this.registerCoreMod(new thisMod(this));
      } catch (error) {
        $console.error({ name: error.name, error: error.message, mod });
      }
    });
  }
  getMod(modId) {
    return this.MOD_LIST[modId];
  }
}
module.exports = {
  __VERSION__,
  Kernel
};
