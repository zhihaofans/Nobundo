const { ModCore } = require("../../Core.js/core");
class ContentData {
  constructor({ id, timestamp, title, type, tag, data, otherData }) {
    this.id = id;
    this.timestamp = timestamp;
    this.title = title;
    this.type = type;
    this.tag = tag;
    this.data = data;
    this.otherData = otherData;
  }
}
class Database {
  constructor(mod) {
    this.SQLITE_FILE =
      mod.App.DATA_DIR.LOCAL +
      mod.MOD_INFO.AUTHOR +
      ".mods." +
      mod.MOD_INFO.ID +
      ".db";
    this.SQLite = new mod.Storage.SQLite(this.SQLITE_FILE);
    this.SQL_TABLE_ID = {
      CONTENT_LIST: "ContentList"
    };
  }
  addContentItem({ id, timestamp, title, type, tag, data, otherData }) {
    const sql =
        type == "text"
          ? `INSERT INTO ${this.SQL_TABLE_ID.CONTENT_LIST} (id, timestamp, title, type, tag, text_data, other_data) values(?, ?, ?, ?, ?, ?, ?)`
          : `INSERT INTO ${this.SQL_TABLE_ID.CONTENT_LIST} (id, timestamp, title, type, tag, blob_data, other_data) values(?, ?, ?, ?, ?, ?, ?)`,
      args = [id, timestamp, title, type, tag, data, otherData],
      sqlResult = this.SQLite.update(sql, args);
    $console.warn({
      sql,
      args
    });
    return sqlResult;
  }
  createContentListTable() {
    const sql = `CREATE TABLE IF NOT EXISTS ${this.SQL_TABLE_ID.CONTENT_LIST}(id TEXT PRIMARY KEY NOT NULL, timestamp INTEGER NOT NULL,title TEXT NOT NULL,type TEXT NOT NULL,tag TEXT,text_data TEXT,blob_data BLOB,other_data TEXT)`,
      result = this.SQLite.update(sql);
    return result;
  }
  getContentList() {
    const sql = `SELECT * FROM ${this.SQL_TABLE_ID.CONTENT_LIST}`,
      sqlResult = this.SQLite.query(sql);
    $console.info(sqlResult);
    if (sqlResult.error) {
      $console.error(sqlResult.error);
      return [];
    } else {
      const queryResult = this.SQLite.parseQueryResult(sqlResult);
      const resultData = queryResult.map(item => {
        const data = item.type == "text" ? item.text_data : item.blob_data;
        return new ContentData({
          id: item.id,
          timestamp: item.timestamp,
          title: item.title,
          type: item.type,
          tag: item.tag,
          data,
          otherData: item.otherData
        });
      });
      $console.warn(resultData);
      return resultData || [];
    }
  }
}

class ContentBoxApi {
  constructor(mod) {
    this.Mod = mod;
    this.$ = mod.$;
    this.DB = new Database(mod);
    this.DB.createContentListTable();
  }
  addContent({ title, data }) {
    const type = "text",
      timestamp = this.$.dateTime.getUnixTime(),
      id = `${$text.uuid}-${timestamp}`,
      tag = "[]",
      otherData = "{}",
      sqlResult = this.DB.addContentItem({
        id,
        timestamp,
        title,
        type,
        tag,
        data,
        otherData
      });
    $console.info(sqlResult);
    if (sqlResult.result == true && sqlResult.error == undefined) {
      $ui.success("添加成功");
    } else {
      $ui.alert({
        title: "",
        message: "",
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
  getContent(id) {}
  getContentList() {
    const contentList = this.DB.getContentList();
    if (contentList.length > 0) {
    } else {
      $ui.error("空白内容");
    }
  }
}

class ContentBoxView {
  constructor(mod) {
    this.Mod = mod;
    this.Api = new ContentBoxApi(this.Mod);
  }
  async init() {
    const menuResult = await $ui.menu(["添加", "查看"]);
    //menuResult.index , menuResult.title
    switch (menuResult.index) {
      case 0:
        this.askToAddContent();
        break;
      case 1:
        this.Api.getContentList();
        break;
      default:
    }
  }
  askToAddContent() {
    $input.text({
      type: $kbType.text,
      placeholder: "title",
      text: "这是一个标题",
      handler: title => {
        if (title.length > 0) {
          $input.text({
            type: $kbType.text,
            placeholder: "text",
            text: "这是你要输入的文本",
            handler: textData => {
              if (textData.length > 0) {
                this.Api.addContent({
                  title,
                  data: textData
                });
              }
            }
          });
        }
      }
    });
  }
}

class ContentBox extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "content_box",
      modName: "内容盒子",
      version: "1",
      author: "zhihaofans",
      useSqlite: false,
      coreVersion: 6
    });
    this.View = new ContentBoxView(this);
  }
  run() {
    this.View.init();
  }

  runApi({ url, data, callback }) {
    //TODO:允许其他Mod调用
    return false;
  }
}
module.exports = ContentBox;
