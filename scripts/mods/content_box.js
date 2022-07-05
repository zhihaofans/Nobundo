const { ModCore } = require("../../Core.js/core"),
  next = require("../../Core.js/next");
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
    this.SQLITE_FILE = `${mod.App.DATA_DIR.LOCAL}${mod.MOD_INFO.AUTHOR}.mods.${mod.MOD_INFO.ID}.db`;
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
    return sqlResult;
  }
  createContentListTable() {
    if (!this.SQLite.hasTable(this.SQL_TABLE_ID.CONTENT_LIST)) {
      const sql = `CREATE TABLE IF NOT EXISTS ${this.SQL_TABLE_ID.CONTENT_LIST}(id TEXT PRIMARY KEY NOT NULL, timestamp INTEGER NOT NULL,title TEXT NOT NULL,type TEXT NOT NULL,tag TEXT,text_data TEXT,blob_data BLOB,other_data TEXT)`,
        result = this.SQLite.update(sql);
      return result;
    }
    return undefined;
  }
  getContentList() {
    const queryResult = this.SQLite.queryAll(this.SQL_TABLE_ID.CONTENT_LIST);
    return queryResult;
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
    if (sqlResult.result == true && sqlResult.error == undefined) {
      $ui.success("添加成功");
    } else {
      $ui.alert({
        title: "SQLITE.ERROR",
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
    const queryResult = this.DB.getContentList(),
      result = queryResult.result;
    if (queryResult.error == undefined) {
      const resultData = queryResult.result.map(item => {
        const data = item.type == "text" ? item.text_data : item.blob_data;
        return new ContentData({
          id: item.id,
          timestamp: item.timestamp,
          title: item.title,
          type: item.type,
          tag: JSON.parse(item.tag),
          data,
          otherData: item.otherData
        });
      });
      return {
        success: true,
        result: resultData || [],
        error: undefined
      };
    } else {
      return {
        success: false,
        error: queryResult.error
      };
    }
  }
}

class ContentBoxView {
  constructor(mod) {
    this.Mod = mod;
    this.Api = new ContentBoxApi(this.Mod);
    this.ListView = new next.ListView();
  }
  async init() {
    const menuResult = await $ui.menu(["添加", "查看"]);
    //menuResult.index , menuResult.title
    switch (menuResult.index) {
      case 0:
        this.askToAddContent();
        break;
      case 1:
        this.showContentList();
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
  showContentList() {
    const contentListResult = this.Api.getContentList();
    if (contentListResult.success) {
      $console.info(contentListResult);
      const contentListData = contentListResult.result.map(item => {
        const dateTime = new next.DateTime();
        dateTime.setDateTime(item.timestamp);
        return {
          title: `${item.title}(${item.type})`,
          rows: [
            {
              title: `TYPE:${item.type}`
            },
            {
              title: dateTime.getFullDateTimeStr()
            },
            {
              title: `TAG:${item.tag.toString()}`
            },
            {
              title: item.data,
              func: data => {
                $console.warn(data);
                // 会自动带入所选项的文本到data
                $ui.alert({
                  title: item.title,
                  message: data,
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
          ]
        };
      });
      this.ListView.pushSimpleList(
        this.Mod.MOD_INFO.NAME,
        contentListData,
        data => {
          $console.info(data);
        }
      );
    } else {
      $ui.error("空白内容");
    }
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
