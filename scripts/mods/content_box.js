const { Core } = require("../../Core.js/core");
class Database {
  constructor(sqlite) {
    this.SQLite = sqlite;
  }
  createContentListTable() {
    const sql = `CREATE TABLE IF NOT EXISTS ContentList(id TEXT PRIMARY KEY NOT NULL, timestamp INTEGER NOT NULL,title TEXT NOT NULL,type TEXT NOT NULL,text_data TEXT,image_data BLOB)`,
      result = this.SQLite.update(sql);
    return result;
  }
  getContentList() {
    const sql = `SELECT * FROM ContentList`,
      result = this.SQLite.query(sql);
  }
}

class ContentData {
  constructor({ id, timestamp, title, type, data }) {
    this.id = id;
    this.timestamp = timestamp;
    this.title = title;
    this.type = type;
    this.data = data;
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
