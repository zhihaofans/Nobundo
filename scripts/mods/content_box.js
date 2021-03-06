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
      $ui.success("????????????");
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
      title: "??????????????????",
      message: `???${contentItem.title}???`,
      actions: [
        {
          title: "OK",
          disabled: false, // Optional
          handler: () => {
            const deleteResult = this.DB.deleteContent(contentItem.id);
            if (deleteResult.result) {
              $console.info(deleteResult);
              $ui.success("????????????");
            } else {
              $console.error(deleteResult.error);
              $ui.error("????????????");
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
    const menuResult = await $ui.menu(["??????", "??????"]);
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
      text: "??????????????????",
      handler: title => {
        if (title.length > 0) {
          $input.text({
            type: $kbType.text,
            placeholder: "text",
            text: "???????????????????????????",
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
      $ui.error("????????????");
    }
  }
  showContentListView(contentListData) {
    const navButtons = [
      {
        title: "??????",
        symbol: "text.badge.plus", // SF symbols are supported
        handler: sender => {
          this.askToAddContent();
        },
        menu: {
          title: "??????",
          items: [
            {
              title: "??????",
              handler: sender => {
                $ui.warning("?????????");
              }
            }
          ]
        }
      }
    ];
    $ui.push({
      props: {
        id: "listview_contentlist",
        title: this.Api.LASTEST_SORT ? "?????????" : "?????????",
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
              const dateTime = new next.DateTime();
              dateTime.setDateTime(contentItem.timestamp);
              return {
                labelTitle: {
                  text: contentItem.title
                },

                labelData: {
                  text: `${dateTime.getShortDateStr()}  ${contentItem.data}`
                }
              };
            })
          },
          layout: $layout.fill,
          events: {
            didSelect: (_sender, indexPath, _data) => {
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
                    title: "??????",
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
      modName: "????????????",
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
    //TODO:????????????Mod??????
    return false;
  }
}
module.exports = ContentBox;
