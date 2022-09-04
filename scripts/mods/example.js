const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$"),
  Next = require("Next");
class Example extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "example",
      modName: "例子",
      version: "7",
      author: "zhihaofans",
      coreVersion: 8,
      useSqlite: false
    });
    this.$ = $;
    this.Http = $.http;
    this.Storage = app.Storage;
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
    //$ui.success("run");
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
