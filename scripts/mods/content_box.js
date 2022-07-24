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
    this.SQLITE_FILE = `${mod.App.DATA_DIR.LOCAL}${mod.MOD_INFO.AUTHOR}.${mod.MOD_INFO.ID}.db`;
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
  deleteContent(contentId) {
    const sql = `DELETE FROM ${this.SQL_TABLE_ID.CONTENT_LIST} WHERE id=?`,
      args = [contentId],
      sqlResult = this.SQLite.update(sql, args);
    return sqlResult;
  }
}

class ContentBoxApi {
  constructor(mod) {
    this.Mod = mod;
    this.$ = mod.$;
    this.DB = new Database(mod);
    this.DB.createContentListTable();
    this.LASTEST_SORT = false;
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
  deleteContent(contentItem) {
    $ui.alert({
      title: "确定删除吗？",
      message: `《${contentItem.title}》`,
      actions: [
        {
          title: "OK",
          disabled: false, // Optional
          handler: () => {
            const deleteResult = this.DB.deleteContent(contentItem.id);
            if (deleteResult.result) {
              $console.info(deleteResult);
              $ui.success("删除成功");
            } else {
              $console.error(deleteResult.error);
              $ui.error("删除失败");
            }
          }
        },
        {
          title: "NO",
          disabled: false, // Optional
          handler: () => {}
        }
      ]
    });
  }
  getContent(id) {}
  getContentList() {
    const queryResult = this.DB.getContentList();
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
      if (this.LASTEST_SORT) {
        resultData.reverse();
      }
      return {
        success: true,
        result: resultData || [],
        count: resultData.length || 0,
        error: undefined
      };
    } else {
      return {
        success: false,
        error: queryResult.error
      };
    }
  }
  setLatestSortMode(isLatest) {
    this.LASTEST_SORT = isLatest == true;
  }
}

class ContentBoxView {
  constructor(mod) {
    this.Mod = mod;
    this.Api = new ContentBoxApi(this.Mod);
    this.ListView = new next.ListView();
  }
  async init() {
    this.Api.setLatestSortMode(true);
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
      this.showContentListView(contentListResult.result);
    } else {
      $ui.error("空白内容");
    }
  }
  showContentListView(contentListData) {
    const navButtons = [
      {
        title: "新增",
        symbol: "text.badge.plus", // SF symbols are supported
        handler: sender => {
          this.askToAddContent();
        },
        menu: {
          title: "更多",
          items: [
            {
              title: "设置",
              handler: sender => {
                $ui.warning("未完善");
              }
            }
          ]
        }
      }
    ];
    $ui.push({
      props: {
        id: "listview_contentlist",
        title: this.Api.LASTEST_SORT ? "新▶旧" : "旧▶新",
        navButtons
      },
      views: [
        {
          type: "list",
          props: {
            autoRowHeight: true,
            estimatedRowHeight: 20,
            template: {
              props: {
                bgcolor: $color("clear")
              },
              views: [
                {
                  type: "stack",
                  props: {
                    axis: $stackViewAxis.vertical,
                    spacing: 5,
                    distribution: $stackViewDistribution.fillProportionally,
                    stack: {
                      views: [
                        {
                          type: "label",
                          props: {
                            id: "labelTitle",

                            align: $align.left,
                            font: $font(24)
                          },
                          layout: make => {
                            make.height.equalTo(24);
                            make.left.top.right.inset(5);
                          }
                        },
                        {
                          type: "label",
                          props: {
                            id: "labelData",

                            align: $align.left,
                            font: $font(12),
                            textColor: $color("gray")
                          },
                          layout: make => {
                            make.height.equalTo(40);
                            make.top.left.right.bottom.inset(2);
                            //                            make.top.equalTo($("labelTitle").bottom);
                          }
                        }
                      ]
                    }
                  },
                  layout: $layout.fill
                }
              ]
            },
            data: contentListData.map(contentItem => {
              const dateTime = new next.DateTime(),
                contentType = contentItem.type,
                dataShowStrList = {
                  image: "[图片]",
                  text: contentItem.data
                },
                dataShowStr = dataShowStrList[contentType];
              dateTime.setDateTime(contentItem.timestamp);
              return {
                labelTitle: {
                  text: contentItem.title
                },

                labelData: {
                  text: `${dateTime.getShortDateStr()}  ${dataShowStr}`
                }
              };
            })
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const row = indexPath.row,
                selectedContent = contentListData[row];
              $ui.alert({
                title: selectedContent.title,
                message: selectedContent.data,
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
                      this.Api.deleteContent(selectedContent);
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
