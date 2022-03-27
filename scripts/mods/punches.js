const { Core } = require("../../Core.js/core");
class DataSql {
  constructor({ dataDir }) {
    this.DATA_DIR = dataDir;
    this.SQL_TABLE_ID = {
      PUNCHES_ITEMS: "punchesItems",
      PUNCHES_GROUP: "punchesGroup"
    };
  }
  getSqlite() {
    const filePath = this.DATA_DIR + "zhihaofans.mods.punches.db";
    $console.info(filePath);
    if (this.DATA_DIR.length > 0) {
      return $sqlite.open(filePath);
    } else {
      return undefined;
    }
  }
  createPunchesItems() {
    const db = this.getSqlite(),
      sql = `CREATE TABLE ${this.SQL_TABLE_ID.PUNCHES_ITEMS}(id TEXT NOT NULL PRIMARY KEY, groupId TEXT NOT NULL,time INTEGER NOT NULL,message TEXT,type TEXT NOT NULL,data TEXT NOT NULL);`,
      result = db.update(sql);
    if (result.error) {
      $console.warn(sql);
      $console.error(result.error);
    }
    return result.result;
  }
  createPunchesGroup() {
    const db = this.getSqlite(),
      sql = `CREATE TABLE ${this.SQL_TABLE_ID.PUNCHES_GROUP}(id TEXT NOT NULL PRIMARY KEY,groupId TEXT NOT NULL,title TEXT NOT NULL,create_time INTEGER NOT NULL,update_time INTEGER NOT NULL,message TEXT,type TEXT,data TEXT);`,
      result = db.update(sql);
    if (result.error) {
      $console.warn(sql);
      $console.error(result.error);
    }
    return result.result;
  }
  createGroup({ groupId, title, message, type, data }) {
    if (groupId && title) {
      const uuid = $text.uuid,
        time = new Date().getTime(),
        sql = `INSERT INTO ${this.SQL_TABLE_ID.PUNCHES_GROUP}(id,groupId,title,create_time,update_time,message,type,data) VALUES(?,?,?,?,?,?,?,?)`,
        args = [
          uuid,
          groupId,
          title,
          time,
          time,
          message || "",
          type || "",
          data || ""
        ],
        db = this.getSqlite(),
        result = db.update({
          sql,
          args
        });
      if (result.error) {
        $console.warn(sql);
        $console.error(result.error);
      }
      return result.result;
    } else {
      return false;
    }
  }
  queryGroupList() {
    const db = this.getSqlite(),
      sql = `SELECT * FROM ${this.SQL_TABLE_ID.PUNCHES_GROUP}`,
      queryResult = [];
    db.query(sql, (rs, err) => {
      while (rs.next()) {
        const values = rs.values;
        const name = rs.get("name"); // Or rs.get(0);
      }
      rs.close();
    });
  }
  init() {
    $console.info(this.createPunchesItems());
    $console.info(this.createPunchesGroup());
  }
}

class PunchesApi {
  constructor(core) {
    this.SQL = new DataSql({
      dataDir: core.Kernel.DATA_DIR.LOCAL
    });
    this.SQL.init();
  }
  getAllPunchItems() {}
  setPunchItem() {}
  addPunchGroup() {
    $input.text({
      type: $kbType.text,
      placeholder: "groupId",
      text: "",
      handler: groupId => {
        if (groupId.length > 0) {
          $input.text({
            type: $kbType.text,
            placeholder: "title",
            text: "",
            handler: title => {
              if (title.length > 0) {
                const result = this.SQL.createGroup({
                  groupId,
                  title
                });
                $console.info({
                  groupId,
                  title,
                  result
                });
              }
            }
          });
        }
      }
    });
  }
  punchIn(id, timestamp, message) {}
}

class PunchesUi {
  constructor(core) {
    this.Api = new PunchesApi(core);
  }
  initUi() {
    $ui.push({
      props: {
        title: "",
        navButtons: [
          {
            title: "",
            icon: "024", // Or you can use icon name
            symbol: "checkmark.seal", // SF symbols are supported
            handler: sender => {
              $ui.alert("Tapped!");
            },
            menu: {
              title: "Context Menu",
              items: [
                {
                  title: "Title",
                  handler: sender => {}
                }
              ]
            } // Pull-Down menu
          }
        ]
      },
      views: [
        {
          type: "list",
          props: {
            data: [
              {
                title: "功能",
                rows: ["新增"]
              },
              {
                title: "列表",
                rows: this.Api.getAllPunchItems()
              }
            ]
          },
          layout: $layout.fill,
          events: {
            didSelect: (_sender, indexPath, _data) => {
              const section = indexPath.section;
              const row = indexPath.row;
              switch (section) {
                case 0:
                  switch (row) {
                    case 0:
                      this.Api.addPunchGroup();
                      break;
                    default:
                  }

                  break;
                default:
              }
            }
          }
        }
      ]
    });
  }
}

class Punches extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      modId: "punches",
      modName: "打卡",
      version: "1",
      author: "zhihaofans",
      needCoreVersion: 3
    });
  }
  run() {
    try {
      const ui = new PunchesUi(this);
      ui.initUi();
    } catch (error) {
      $console.error(error);
    }
  }
}
module.exports = Punches;
