const { Core } = require("../../Core.js/core");
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
                      thisKey = keys[row];
                    $ui.alert({
                      title: thisKey,
                      message: keychainCore.get(thisKey),
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
                          disabled: true, // Optional
                          handler: () => {}
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
  constructor(sql_file_path) {
    this.SQL_FILE_PATH = sql_file_path;
    this.DB = $sqlite.open(sql_file_path);
  }
  createTable(
    tableId,
    columnList = {
      uuid: "TEXT",
      title: "TEXT",
      timestamp: "INTEGER"
    }
  ) {
    const sql = `CREATE TABLE ${tableId}(name text, age integer)`;
    return this.update(sql);
  }
  query(
    sql,
    handler = (rs, err) => {
      while (rs.next()) {
        const values = rs.values;
        const name = rs.get("name"); // Or rs.get(0);
      }
      rs.close();
    }
  ) {
    this.DB.query(sql, handler);
  }
  update(sql) {
    return this.DB.update(sql);
  }
}
class SQLiteView {
  constructor(name) {
    this.NAME = name;
  }
  init() {
    $input.text({
      type: $kbType.text,
      placeholder: "数据库文件",
      text: "/assets/.files/mods.db",
      handler: path => {
        try {
          const sqliteCore = new SQLiteCore(path);
        } catch (error) {
          $console.error(error);
        }
      }
    });
  }
}

class HelperView {
  constructor(core) {
    this.sqliteView = new SQLiteView();
    this.keychainView = new KeychainView(core);
  }
  init() {
    $ui.menu({
      items: ["SQLite", "Keychain"],
      handler: (title, idx) => {
        switch (idx) {
          case 0:
            this.sqliteView.init();
            break;
          case 1:
            this.keychainView.init();
            break;
        }
      }
    });
  }
}

class DatabaseHelper extends Core {
  constructor(app) {
    super({
      app,
      modId: "datacenter",
      modName: "数据中心",
      version: "1",
      author: "zhihaofans",
      coreVersion: 5
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
module.exports = DatabaseHelper;
