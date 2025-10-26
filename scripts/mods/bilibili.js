const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$");
const moduleList = ["bilibili.auth.js"];
class Bilibili extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "bilibili",
      modName: "哔哩哔哩",
      version: "1",
      author: "zhihaofans",
      coreVersion: 18,
      useSqlite: true,
      allowWidget: true,
      allowApi: true,
      iconName: "bold"
    });
    this.Storage = Storage;
    this.ModuleLoader = new ModuleLoader(this);
    this.ModuleLoader.addModulesByList(moduleList);
  }
  run() {
    try {
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
module.exports = Bilibili;
