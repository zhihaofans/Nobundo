const { ModCore, ModuleLoader } = require("CoreJS");
class ItemData {
  constructor(data) {
    this.uuid = data.uuid || $text.uuid;
    this.name = data.name;
    this.phoneList = data.phoneList || [];
    this.address = data.address;
    this.sex = data.sex; //0男，1女
    this.text = data.text;
    this.data_json = data.data_json || "{}";
  }
  init() {}
}
class Example extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "social",
      modName: "社交",
      version: "1",
      author: "zhihaofans",
      coreVersion: 19,
      iconName: "person.2.fill"
    });
    this.ModuleLoader = new ModuleLoader(this);
  }
  run() {
    try {
      $ui.push({
        props: {
          title: "社交模块"
        },
        views: [
          {
            type: "list",
            props: {
              data: ["itemList"]
            },
            layout: $layout.fill,
            events: {
              didSelect: (sender, indexPath, data) => {
                const { section, row } = indexPath;
              }
            }
          }
        ]
      });
    } catch (error) {
      $console.error(error);
    }
    //$ui.success("run");
  }
}
module.exports = Example;
