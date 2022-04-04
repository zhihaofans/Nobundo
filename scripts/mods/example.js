const { Core } = require("../../Core.js/core"),
  { ModuleLoader } = require("../../Core.js/core.module");
class Example extends Core {
  constructor(app) {
    super({
      app,
      modId: "example",
      modName: "例子",
      version: "6",
      author: "zhihaofans",
      needCoreVersion: 4
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
}
module.exports = Example;
