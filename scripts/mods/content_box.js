const { Core } = require("../../Core.js/core");
class Database {
  constructor(sqlite) {
    this.SQLite = sqlite;
    this.SQL_TABLE_ID = {
      CONTENT_LIST: "ContentList"
    };
  }
  createContentListTable() {
    const sql = `CREATE TABLE IF NOT EXISTS ${this.SQL_TABLE_ID.CONTENT_LIST}(id TEXT PRIMARY KEY NOT NULL, timestamp INTEGER NOT NULL,title TEXT NOT NULL,type TEXT NOT NULL,tag TEXT,text_data TEXT,blob_data BLOB,other_data TEXT)`,
      result = this.SQLite.update(sql);
    return result;
  }
  getContentList() {
    const sql = `SELECT * FROM ${this.SQL_TABLE_ID.CONTENT_LIST}`,
      result = this.SQLite.query(sql),
      queryResult = this.SQLite.parseQueryResult(result);
    return queryResult.map(item => {
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
  }
}

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
class ContentBoxApi {
  constructor(core) {
    this.DB = new Database(core.SQLITE);
  }
  getContent(id) {}
}

class ContentBoxView {
  constructor(core) {
    this.Core = core;
  }
  init() {}
}

class ContentBox extends Core {
  constructor(app) {
    super({
      app,
      modId: "content_box",
      modName: "内容盒子",
      version: "1",
      author: "zhihaofans",
      coreVersion: 5
    });
  }
  run() {}

  runApi({ url, data, callback }) {
    //TODO:允许其他Mod调用
    return false;
  }
}
module.exports = ContentBox;
