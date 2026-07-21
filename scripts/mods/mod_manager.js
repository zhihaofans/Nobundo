const { ModCore } = require("CoreJS"),
  $ = require("$"),
  { KeychainKit } = require("DataKit");
class ManagerCore {
  constructor(app) {
    this.App = app;
    this.ModLoader = app.modLoader;
  }
  getModList() {
    return this.ModLoader.getModList();
  }
  getKeychainList(modId) {
    try {
      const thisMod = this.ModLoader.getMod(modId);
      const Keychain = thisMod.Keychain;
      if (thisMod == undefined || Keychain == undefined) {
        $ui.error("undefined");
      } else {
        const keyList = Keychain.getKeyList() || [];
        $ui.push({
          props: {
            title: thisMod.MOD_INFO.NAME + ":" + keyList.length
          },
          views: [
            {
              type: "list",
              props: {
                data: keyList,
                actions: [
                  {
                    title: "delete",
                    color: $color("gray"), // default to gray
                    handler: (sender, indexPath) => {
                      $ui.alert({
                        title: "确定删除吗",
                        message: keyList[indexPath.row],
                        actions: [
                          {
                            title: "删除",
                            disabled: false, // Optional
                            handler: () => {}
                          },
                          {
                            title: "Cancel",
                            handler: () => {}
                          }
                        ]
                      });
                    }
                  }
                ]
              },
              layout: $layout.fill,
              events: {
                didSelect: (a, b, key) => {
                  const value = Keychain.get(key);
                  let desc = "";
                  if (!$.hasString(value)) {
                    desc = "空白值或读取失败";
                  }
                  $.inputText(value, desc).then(text => {
                    if (text != value) {
                      const su = Keychain.set(key, text);
                      $console.info({
                        su,
                        key,
                        old: value,
                        new: text
                      });
                    }
                  });
                }
              }
            }
          ]
        });
      }
    } catch (error) {
      $console.error(error);
      $ui.error("加载失败");
    }
  }
}

class ModManager extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "mod_manager",
      modName: "模组管理器",
      version: "1",
      author: "zhihaofans",
      coreVersion: 18,
      iconName: "square.grid.3x2",
      useSqlite: false
    });
    this.managerCore = new ManagerCore(app);
  }
  run() {
    try {
      this.initModListView();
    } catch (error) {
      $console.error(error);
    }
  }
  initModListView() {
    const modList = this.managerCore.getModList();
    if (modList.id.length > 0) {
      $ui.push({
        props: {
          title: ""
        },
        views: [
          {
            type: "list",
            props: {
              data: modList.id
            },
            layout: $layout.fill,
            events: {
              didSelect: (sender, indexPath, data) => {
                const section = indexPath.section,
                  row = indexPath.row,
                  thisModId = modList.id[row];
                $ui.menu({
                  items: ["获取Keychain列表"],
                  handler: (title, idx) => {
                    switch (idx) {
                      case 0:
                        this.managerCore.getKeychainList(thisModId);
                        break;
                    }
                  }
                });
              }
            }
          }
        ]
      });
    } else {
      $ui.alert({
        title: "加载失败",
        message: "空白模组列表",
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    }
  }
}
module.exports = ModManager;
