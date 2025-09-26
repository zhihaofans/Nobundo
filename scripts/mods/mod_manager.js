const { ModCore } = require("CoreJS"),
  $ = require("$"),
  Next = require("Next");
class ManagerCore {
  constructor(app) {
    this.App = app;
    this.ModLoader = app.modLoader;
  }
  getModList() {
    return this.ModLoader.getModList();
  }
  updateModKeychainDomain(modId) {
    const thisMod = this.ModLoader.getMod(modId);
    if (thisMod == undefined) {
      return undefined;
    } else {
      const oldKeychain = new Next.Storage.Keychain(
          thisMod.MOD_INFO.KEYCHAIN_DOMAIN_OLD
        ),
        newKeychain = new Next.Storage.Keychain(
          thisMod.MOD_INFO.KEYCHAIN_DOMAIN_NEW
        ),
        keyList = oldKeychain.getKeyList();
      $console.info({
        old_id: thisMod.MOD_INFO.KEYCHAIN_DOMAIN_OLD,
        new_id: thisMod.MOD_INFO.KEYCHAIN_DOMAIN_NEW,
        old: oldKeychain.getAll(),
        new: newKeychain.getAll()
      });
      if (keyList == undefined || keyList.length == 0) {
        return false;
      } else {
        const itemList = {};
        itemList[modId] = oldKeychain.getAll();
        keyList.map(key => {
          const itemValue = oldKeychain.getValue(key);
          newKeychain.setValue(key, itemValue);
          oldKeychain.remove(key);
        });
        return true;
      }
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
      coreVersion: 9,
      iconName:"square.grid.3x2",
      useSqlite: false
    });
    this.Http = $.http;
    this.Storage = Next.Storage;
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
                  items: ["更新模组Keychain域名"],
                  handler: (title, idx) => {
                    switch (idx) {
                      case 0:
                        $ui.loading(true);
                        const result = this.managerCore.updateModKeychainDomain(
                          thisModId
                        );
                        $ui.loading(false);
                        if (result == undefined) {
                          $ui.alert({
                            title: "更新失败",
                            message: "可能是找不到该模组id",
                            actions: [
                              {
                                title: "OK",
                                disabled: false, // Optional
                                handler: () => {}
                              }
                            ]
                          });
                        } else {
                          $ui.alert({
                            title: "更新完毕",
                            message: result ? "更新成功" : "不需要更新",
                            actions: [
                              {
                                title: "OK",
                                disabled: false, // Optional
                                handler: () => {}
                              }
                            ]
                          });
                        }

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
