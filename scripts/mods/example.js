const { ModCore, ModuleLoader } = require("CoreJS");

class Example extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "example",
      modName: "例子",
      version: "12",
      author: "zhihaofans",
      coreVersion: 18,
      useSqlite: true,
      allowWidget: true,
      allowApi: true,
      iconName: "command"
    });

    this.ModuleLoader = new ModuleLoader(this);
    this.ModuleLoader.addModule("example.ui.js");
  }
  run() {
    try {
      this.runSqlite();
      const ui = this.ModuleLoader.getModule("example.ui");
      ui.initUi();
    } catch (error) {
      $console.error(error);
    }
    //$ui.success("run");
  }
  runWidget(widgetId) {
    $widget.setTimeline({
      render: ctx => {
        return {
          type: "text",
          props: {
            text: widgetId || "Hello!"
          }
        };
      }
    });
  }
  runApi({ apiId, data, callback }) {
    $console.info({
      apiId,
      data,
      callback
    });
    switch (apiId) {
      case "example.ui":
        this.ModuleLoader.getModule("example.ui").initUi();

        break;
      default:
    }
  }
}
module.exports = Example;
