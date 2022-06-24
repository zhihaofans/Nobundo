const { ModCore, ModuleLoader } = require("../../Core.js/core");
class Example extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "example",
      modName: "例子",
      version: "6b",
      author: "zhihaofans",
      coreVersion: 6
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
  runWidget() {
    const inputValue = $widget.inputValue ? `[${$widget.inputValue}]` : "";
    $widget.setTimeline({
      render: ctx => {
        return {
          type: "text",
          props: {
            text: `${inputValue}Hello, Example!`
          }
        };
      }
    });
  }
  runApi({ url, data, callback }) {
    //TODO:允许其他Mod调用
    this.allowApi = true;
  }
}
module.exports = Example;
