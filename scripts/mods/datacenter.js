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
  constructor(mod) {
    this.Keychain = mod.Keychain;
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
  insert(table, columnObject) {
    const columnKeys = Object.keys(columnObject);

    if (columnKeys.length == 0) {
      return undefined;
    } else {
      const columnValueList = [];

      var a = "";
      columnKeys.map(key => {
        columnValueList.push(columnObject[key]);
        if (a.length > 0) {
          a += ",";
        }
        a += "?";
      });
      const sql = `INSERT INTO ${table} (${columnKeys.toString()}) VALUES(${a})`,
        updateResult = this.update(sql, columnValueList);
      $console.info({
        sql,
        updateResult
      });
      return updateResult;
    }
  }
  query(
    sql,
    handler = (rs, err) => {
      $console.info(rs.columnCount);
      while (rs.next()) {
        const values = rs.values;
        $console.info(values);
      }
      rs.close();
    }
  ) {
    this.DB.queryHandler(sql, handler);
  }
  queryAll(tableId) {
    if (!this.DB.hasTable(tableId)) {
      return undefined;
    } else {
      const queryResultList = [],
        sql = `SELECT * FROM ${tableId}`,
        handler = (rs, err) => {
          if (err) {
            $console.error(err);
          }
          $console.info(rs.columnCount);
          while (rs.next()) {
            queryResultList.push(rs.values);
          }
          rs.close();
        };
      this.DB.queryHandler(sql, handler);
      return queryResultList;
    }
  }
  update(sql, args) {
    return this.DB.update(sql, args);
  }
  delete(table, columnObject) {
    const columnKeys = Object.keys(columnObject),
      columnStrList = [];
    if (columnKeys.length == 0) {
      return undefined;
    } else {
      const args = [];
      var whereStr = "";
      columnKeys.map(key => {
        columnStrList.push();
        if (whereStr.length > 0) {
          whereStr += " AND ";
        }
        whereStr += key + "=? ";
        args.push(columnObject[key]);
      });
      const sql = `DELETE FROM ${table} WHERE ${whereStr}`,
        updateResult = this.update(sql, args);
      $console.info({
        sql,
        args,
        updateResult
      });
      return updateResult;
    }
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
    $input.text({
      type: $kbType.text,
      placeholder: "table id",
      text: "bilibili",
      handler: tableId => {
        if (tableId.length > 0) {
          this.initTableView(sqliteCore, tableId);
        }
      }
    });
  }
  queryAll(sqliteCore, tableId) {
    const queryResult = sqliteCore.queryAll(tableId);
    if (queryResult != undefined) {
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
              didSelect: (_sender, indexPath, data) => {
                const section = indexPath.section,
                  row = indexPath.row,
                  selectItem = queryResult[section];
                $console.info({
                  section,
                  row,
                  selectItem
                });
                $ui.alert({
                  title: "菜单",
                  message: JSON.stringify(selectItem),
                  actions: [
                    {
                      title: "OK",
                      disabled: false, // Optional
                      handler: () => {}
                    },
                    {
                      title: "删除",
                      disabled: false, // Optional
                      handler: () => {
                        const deleteResult = sqliteCore.delete(
                          tableId,
                          selectItem
                        );
                        if (deleteResult.result) {
                          $console.info(deleteResult);
                          $ui.success("已删除");
                        } else {
                          $console.error(deleteResult.error);
                          $ui.error("删除失败");
                        }
                      }
                    }
                  ]
                });
              }
            }
          }
        ]
      });
    } else {
      $ui.error("我觉得不存在该表");
    }
  }
  initTableView(sqliteCore, tableId) {
    const menuList = ["查询所有", "插入"];
    this.uiKit.showMenu(menuList, idx => {
      switch (idx) {
        case 0:
          this.queryAll(sqliteCore, tableId);
          break;
        case 1:
          this.insertItem(sqliteCore, tableId);
          break;
        default:
      }
    });
  }
  insertItem(sqliteCore, tableId) {
    const columnObject = {};
    $input.text({
      type: $kbType.text,
      placeholder: "key",
      text: "",
      handler: key => {
        if (key.length > 0) {
          $input.text({
            type: $kbType.text,
            placeholder: "value",
            text: "",
            handler: value => {
              if (value.length > 0) {
                columnObject.id = key;
                columnObject.value = value;
                const insertResult = sqliteCore.insert(tableId, columnObject);

                if (insertResult.result) {
                  $console.info(insertResult);
                } else {
                  $console.error(insertResult.error);
                }
              }
            }
          });
        }
      }
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
      coreVersion: 7
    });
    this.$ = app.$;
    this.Storage = app.Storage;
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
