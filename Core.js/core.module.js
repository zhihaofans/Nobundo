const __VERSION__ = 1;
class CoreModule {
  constructor({ coreId, moduleId, moduleName, author, version }) {
    this.CORE_ID = coreId;
    this.MODULE_ID = moduleId;
    this.MODULE_NAME = moduleName;
    this.AUTHOR = author;
    this.VERSION = version;
  }
}
class ModuleLoader {
  constructor(core) {
    this.Core = core;
    this.App = core.App;
    this.Kernel = this.App.kernelIndex;
    this.MOD_DIR = this.App.MOD_DIR;
    this.ModuleList = {};
  }
  addModule(fileName) {
    if (fileName.length <= 0) {
      $console.error({
        name: "core.module.ModuleLoader.addModule",
        MOD_NAME: this.Core.CORE_INFO.NAME,
        message: "需要module fileName",
        fileName,
        length: fileName.length
      });
      return false;
    }
    const modulePath = this.MOD_DIR + fileName;
    $console.info({ modulePath });
    if (this.Core.CORE_INFO.ID.length <= 0) {
      $console.error({
        name: "core.module.ModuleLoader.addModule",
        message: "需要Core.MOD_ID",
        MOD_NAME: this.Core.CORE_INFO.NAME
      });
      return false;
    }

    if (!$file.exists(modulePath) || $file.isDirectory(modulePath)) {
      $console.error({
        name: "core.module.ModuleLoader.addModule",
        message: "module文件不存在",
        MOD_NAME: this.Core.CORE_INFO.NAME,
        fileName
      });
      return false;
    }
    try {
      const moduleFile = require(modulePath),
        thisModule = new moduleFile(this.Core);
      if (this.Core.CORE_INFO.ID != thisModule.CORE_ID) {
        $console.error({
          name: "core.module.ModuleLoader.addModule",
          message: "CORE_ID错误",
          MOD_NAME: this.Core.CORE_INFO.NAME,
          CORE_ID: thisModule.CORE_ID,
          MOD_ID: this.Core.CORE_INFO.ID,
          MODULE_ID: thisModule.MODULE_ID,
          MODULE_NAME: thisModule.MODULE_NAME
        });
        return false;
      }
      this.ModuleList[thisModule.MODULE_ID] = thisModule;
      $console.info(
        `Mod[${this.Core.CORE_INFO.NAME}]加载module[${thisModule.MODULE_NAME}]`
      );
      return true;
    } catch (error) {
      $console.error({
        id: "core.module.ModuleLoader.addModule.try",
        fileName,
        MOD_NAME: this.Core.CORE_INFO.NAME,
        error: error.message
      });
      return false;
    }
  }
  getModule(moduleId) {
    return this.ModuleList[moduleId];
  }
}

module.exports = {
  __VERSION__,
  CoreModule,
  ModuleLoader
};
