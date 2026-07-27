const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$"),
  HttpLib = require("HttpLib");
const moduleList = ["v2ex.topics.js"];
class Example extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "v2ex",
      modName: "V2EX",
      version: "1",
      author: "zhihaofans",
      coreVersion: 19,
      allowWidget: false,
      iconName: "v.square"
    });
    this.ModuleLoader = new ModuleLoader(this);
    this.ModuleLoader.addModulesByList(moduleList);
    this.Topics = this.ModuleLoader.getModule("v2ex.topics");
  }
  run() {
    try {
      this.Topics.getHotList()
    } catch (error) {
      $console.error(error);
    }
    //$ui.success("run");
  }
}
module.exports = Example;
