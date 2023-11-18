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
class ScoopUtil {
  constructor() {}
  copy(text) {
    $input.text({
      type: $kbType.text,
      placeholder: "",
      text,
      handler: text => {
        $clipboard.text = text;
        $ui.success("复制成功");
      }
    });
  }
  shareJsonData(fileName, jsonData) {
    $share.sheet([
      {
        name: fileName,
        data: this.toFormatJson(jsonData)
      }
    ]);
  }
  shareStr(fileName, data) {
    $share.sheet([
      {
        name: fileName,
        data
      }
    ]);
  }
  toFormatJson(json) {
    return JSON.stringify(json, null, 2);
  }
}
class ScoopCore {
  constructor(mod) {
    this.Mod = mod;
    this.ModuleLoader = mod.ModuleLoader;
    this.SiteList = {
      dotnet: this.ModuleLoader.getModule("scoop.dotnet"),
      everything: this.ModuleLoader.getModule("scoop.everything"),
      git: this.ModuleLoader.getModule("scoop.git"),
      nodejs: this.ModuleLoader.getModule("scoop.nodejs")
    };
  }
  getData(site) {
    return new Promise((resolve, reject) => {
      if ($.hasString(site)) {
        const thisSite = this.SiteList[site];
        if (thisSite) {
          thisSite.getData().then(resolve, reject);
        } else {
          $console.error(`getData(SiteList[site]=undefined)`);
          reject(undefined);
        }
      } else {
        $console.error(`getData(${site})`);
        reject(undefined);
      }
    });
  }
  init(site, version) {
    const thisSite = this.SiteList[site];
    $ui.alert({
      title: thisSite.MODULE_NAME,
      message: "Hello World",
      actions: [
        {
          title: "Bye",
          disabled: false, // Optional
          handler: () => {}
        },
        {
          title: "导出",
          handler: () => {
            $.startLoading();
            const fileName = thisSite.getFileName(version);
            thisSite
              .getData(version)
              .then(data => {
                $console.info(data);
                if (data) {
                  this.Mod.Util.shareJsonData(fileName, data);
                } else {
                  $ui.error("导出空白");
                }
              })
              .catch(error => {
                $console.error({
                  getData: site,
                  thisSite
                });
              })
              .finally(() => {
                $.stopLoading();
              });
          }
        },
        {
          title: "复制更新日志",
          handler: () => {
            $.startLoading();
            thisSite
              .getUpdateNote(version)
              .then(updateNote => {
                $console.info(updateNote);
                if ($.hasString(updateNote)) {
                  this.Mod.Util.copy(updateNote);
                } else {
                  $ui.error("空白");
                }
              })
              .catch(error => {
                $console.error({
                  getUpdateNote: site,
                  thisSite
                });
              })
              .finally(() => {
                $.stopLoading();
              });
          }
        }
      ]
    });
  }
  checkVersion(site) {
    const thisSite = this.SiteList[site];
    if ($.hasString(site) && thisSite) {
      if (thisSite.hasMultipleVersion() === true) {
        const versionList = thisSite.getVersionList();
        $console.info(site, versionList);
        $ui.menu({
          items: versionList,
          handler: (title, idx) => {
            this.init(site, versionList[idx]);
          }
        });
      } else {
        this.init(site);
      }
    } else {
      $ui.error("错误站点");
    }
  }
}
class Scoop extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "scoop",
      modName: "Scoop",
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
    this.ModuleLoader.addModule("scoop.everything.js");
    this.Util = new ScoopUtil();
    this.Core = new ScoopCore(this);
  }
  run() {
    try {
      const itemList = ["Node.js", ".Net", "Everything"];
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
                    this.Core.checkVersion("nodejs");
                    break;
                  case 1:
                    this.Core.checkVersion("dotnet");
                    break;
                  case 2:
                    this.Core.checkVersion("everything");
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
