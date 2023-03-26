const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$"),
  Next = require("Next");
class JsonGenerator {
  constructor() {}
  getJson({
    env_add_path,
    description,
    license,
    persist,
    post_install,
    url,
    version
  }) {
    const result = {
      version,
      description,
      license,
      persist,
      env_add_path,
      post_install
    };
    if ($.hasString(url)) {
      result["url"] = url;
    } else if (url["architecture"] != undefined) {
      result["architecture"] = url.architecture;
    } else if (url["64bit"] != undefined || url["32bit"] != undefined) {
      result["architecture"] = {
        "64bit": url["64bit"],
        "32bit": url["32bit"]
      };
    }
  }
}
class Scoop extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "scoop",
      modName: "scoop",
      version: "1",
      author: "zhihaofans",
      coreVersion: 12,
      useSqlite: false
    });
    this.Http = new Next.Http(5);
    this.Storage = Next.Storage;
    this.JsonGenerator = new JsonGenerator();
    this.ModuleLoader = new ModuleLoader(this);
    this.ModuleLoader.addModule("scoop.nodejs.js");
    this.ModuleLoader.addModule("scoop.dotnet.js");
  }
  run() {
    try {
      const itemList = ["Node.js", ".Net"];
      $ui.push({
        props: {
          title: "listview"
        },
        views: [
          {
            type: "list",
            props: {
              data: itemList
            },
            layout: $layout.fill,
            events: {
              didSelect: (sender, indexPath, data) => {
                switch (indexPath.row) {
                  case 0:
                    this.ModuleLoader.getModule("scoop.nodejs").initUi();
                    break;
                  case 1:
                    this.ModuleLoader.getModule("scoop.dotnet").initUi();
                    break;
                  default:
                }
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
module.exports = Scoop;
