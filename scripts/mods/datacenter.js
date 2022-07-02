const { ModCore } = require("../../Core.js/core"),
  Next = require("../../Core.js/next");
class KeychainCore {
  constructor(domain) {
    this.DOMAIN = domain;
  }
  getAllValue() {
    const result = {},
      keys = this.getKeyList();
    keys.map(k => (result[k] = this.get(k)));
    return result;
  }
  getKeyList() {
    return $keychain.keys(this.DOMAIN);
  }

  get(key) {
    return $keychain.get(key, this.DOMAIN);
  }
  remove(key) {
    return $keychain.remove(key, this.DOMAIN);
  }
  set(key, value) {
    return $keychain.set(key, value, this.DOMAIN);
  }
}
class KeychainView {
  constructor(core) {
    this.Core = core;
    this.Keychain = core.Keychain;
  }
  init() {
    $input.text({
      type: $kbType.text,
      placeholder: "域名",
      text: this.Keychain.get("lastdomain"),
      handler: domain => {
        if (domain != undefined && domain.length > 0) {
          this.Keychain.set("lastdomain", domain);

          const keychainCore = new KeychainCore(domain),
            keys = keychainCore.getKeyList();
          $console.info(keys);
          $ui.push({
            props: {
              title: domain
            },
            views: [
              {
                type: "list",
                props: {
                  data: keys
                },
                layout: $layout.fill,
                events: {
                  didSelect: (_sender, indexPath, _data) => {
                    const row = indexPath.row,
                      thisKey = keys[row],
                      thisValue = keychainCore.get(thisKey);
                    $ui.alert({
                      title: thisKey,
                      message: thisValue,
                      actions: [
                        {
                          title: "没事了",
                          disabled: false, // Optional
                          handler: () => {}
                        },
                        {
                          title: "编辑",
                          disabled: true, // Optional
                          handler: () => {}
                        },
                        {
                          title: "删除",
                          disabled: false, // Optional
                          handler: () => {
                            const removeResult = keychainCore.remove(thisKey);
                            if (removeResult) {
                              $ui.success(removeResult);
                            } else {
                              $ui.error(removeResult);
                            }
                          }
                        },
                        {
                          title: "分享",
                          disabled: false, // Optional
                          handler: () => {
                            $share.sheet([thisValue]);
                          }
                        }
                      ]
                    });
                  }
                }
              }
            ]
          });
        }
      }
    });
  }
}

class SQLiteCore {
  constructor(sqlite) {
    this.DB = sqlite;
  }
  createTable(
    tableId,
    columnList = [`uuid TEXT NOT NULL`, `title TEXT`, `timestamp INTEGER`]
  ) {
    const sql = `CREATE TABLE ${tableId}(${columnList.toString()})`;
    return this.update(sql);
  }
  query(
    sql,
    handler = (rs, err) => {
      $console.info(rs.columnCount);
      while (rs.next()) {
        const values = rs.values;
        const name = rs.get("name"); // Or rs.get(0);
        $console.info(values);
      }
      rs.close();
    }
  ) {
    this.DB.queryHandler(sql, handler);
  }
  queryAll(tableId) {
    const queryResultList = [],
      sql = `SELECT * FROM ${tableId}`,
      handler = (rs, err) => {
        $console.info(rs.columnCount);
        while (rs.next()) {
          queryResultList.push(rs.values);
        }
        rs.close();
      };
    this.DB.queryHandler(sql, handler);
    return queryResultList;
  }
  update(sql, args) {
    return this.DB.update(sql, args);
  }
}
class SQLiteView {
  constructor(mod) {
    this.Mod = mod;
    this.uiKit = new Next.UiKit();
  }
  init() {
    const menuList = ["输入数据库文件路径", "查看目录下的数据库文件"];
    this.uiKit.showMenu(menuList, idx => {
      switch (idx) {
        case 0:
          this.inputFilePath();
          break;
        default:
      }
    });
  }
  inputFilePath() {
    $input.text({
      type: $kbType.text,
      placeholder: "数据库文件",
      text: "/assets/.files/mods.db",
      handler: path => {
        if (path.length > 0) {
          try {
            const sqliteCore = new SQLiteCore(
              new this.Mod.Storage.SQLite(path)
            );
            this.initView(sqliteCore);
          } catch (error) {
            $console.error(error);
          }
        } else {
          $ui.error("请输入数据库文件路径");
        }
      }
    });
  }
  initView(sqliteCore) {
    const menuList = ["查询所有"];
    this.uiKit.showMenu(menuList, idx => {
      switch (idx) {
        case 0:
          $input.text({
            type: $kbType.text,
            placeholder: "table id",
            text: "bilibili",
            handler: tableId => {
              if (tableId.length > 0) {
                this.queryAll(sqliteCore, tableId);
              }
            }
          });
          break;
        default:
      }
    });
  }
  queryAll(sqliteCore, tableId) {
    const queryResult = sqliteCore.queryAll(tableId);
    $ui.push({
      props: {
        title: ""
      },
      views: [
        {
          type: "list",
          props: {
            data: queryResult.map(item => {
              const keys = Object.keys(item);
              return {
                title: "",
                rows: keys.map(key => `${key}:${item[key]}`)
              };
            })
          },
          layout: $layout.fill,
          events: {
            didSelect: (_sender, indexPath, _data) => {
              const section = indexPath.section,
                row = indexPath.row;
            }
          }
        }
      ]
    });
  }
}

class HelperView {
  constructor(mod) {
    this.sqliteView = new SQLiteView(mod);
    this.keychainView = new KeychainView(mod);
  }
  init() {
    $ui.menu({
      items: ["SQLite", "Keychain", "文件选择"],
      handler: (title, idx) => {
        switch (idx) {
          case 0:
            this.sqliteView.init();
            break;
          case 1:
            this.keychainView.init();
            break;
          case 2:
            $drive.open({
              types: ["sqlite.db"],
              handler: data => {
                $console.info(data);
              }
            });
            break;
        }
      }
    });
  }
}

class DataCenter extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "datacenter",
      modName: "数据中心",
      version: "1",
      author: "zhihaofans",
      coreVersion: 6
    });
  }
  run() {
    const helperView = new HelperView(this);
    helperView.init();
  }
  runApi({ apiId, apiData, callback }) {
    //TODO:允许其他Mod调用
    return false;
  }
}
module.exports = DataCenter;
