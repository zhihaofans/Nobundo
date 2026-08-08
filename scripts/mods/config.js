const { ModCore } = require("CoreJS");
//$ = require("$"),

class ModConfigView {
  constructor(mod) {
    this.Mod = mod;
    this.ModLoader = mod.App.ModLoader;
  }
  init() {
    $console.info(this.ModLoader);
    const appInfo = this.Mod.App.AppInfo;
    let modList = [];
    try {
      modList = this.ModLoader.getModListNew().filter(
        mod => mod.MOD_INFO.ALLOW_CONFIG == true
      );
      $console.info(modList);
    } catch (error) {
      $console.error(error);
    }
    const listData = [
      {
        title: appInfo.name,
        rows: [`版本：${appInfo.version}`, `作者：${appInfo.author}`]
      },
      {
        title: "Mod",
        rows: modList.map(mod => mod.MOD_INFO.NAME)
      }
    ];
    $ui.push({
      props: {
        title: this.Mod.MOD_INFO.NAME
      },
      views: [
        {
          type: "list",
          props: {
            data: listData
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const { section, row } = indexPath;
              if (section == 1) {
                const mod = modList[row];
                try {
                  mod.Config.showConfig();
                } catch (error) {
                  $console.error(error);
                  $ui.error("打开Mod设置失败");
                }
              }
            }
          }
        }
      ]
    });
  }
}
class Example extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "config",
      modName: "设置",
      version: "1",
      author: "zhihaofans",
      coreVersion: 21,
      useSqlite: false,
      allowWidget: false,
      allowApi: true,
      iconName: "gear"
    });
  }
  run() {
    try {
      new ModConfigView(this).init();
    } catch (error) {
      $console.error(error);
    }
    //$ui.success("run");
  }
  runApi({ apiId, data, callback }) {
    $console.info({
      apiId,
      data,
      callback
    });
    switch (apiId) {
      case "config.show_one_string":
        this.Core.showOneStringConfig(
          data.title,
          data.id,
          data.defaultValue
        ).then(result => {
          $console.info(result);
          callback(result);
        });
        break;
      case "config.show_config":
        this.Core.showConfig(data.config).then(result => {
          $console.info(result);
          callback(result);
        });
        break;
      default:
    }
  }
}
module.exports = Example;
