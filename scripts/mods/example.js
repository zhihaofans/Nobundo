const { Core } = require("../../Core.js/core"),
  { ModuleLoader } = require("../../Core.js/core.module");
class Example extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      modId: "example",
      modName: "例子",
      version: "5b",
      author: "zhihaofans",
      needCoreVersion: 3,
      databaseId: "example",
      keychainId: "example"
    });
    this.ModuleLoader = new ModuleLoader(this);
  }
  run() {
    this.ModuleLoader.addModule("example.ui.js");
    try {
      const ui = this.ModuleLoader.getModule("example.ui");
      ui.initUi();
    } catch (error) {
      $console.error(error);
    }
    $ui.success("run");
  }
}
module.exports = Example;
