const { ModCore } = require("CoreJS"),
  $ = require("$"),
  Next = require("Next");
class ClipboardCore {
  constructor(mod) {
    this.Mod = mod;
    this.Sqlite = mod.SQLITE;
    this.SQLITE_KEY = {
      item_list: "clipboard_item_list"
    };
  }
  addItem(text) {
    const itemList = this.getAllItem();
    itemList.push(text);
    return this.setItemList(itemList);
  }
  clearItemList() {
    return this.Sqlite.deleteItem(this.SQLITE_KEY.item_list);
  }
  getAllItem() {
    const sqliteResult = this.Sqlite.getItem(this.SQLITE_KEY.item_list);
    if (sqliteResult == undefined || sqliteResult.length == 0) {
      return [];
    } else {
      try {
        return JSON.parse(sqliteResult);
      } catch (error) {
        $console.error(error);
        return [];
      }
    }
  }
  removeItem(index, text) {
    let itemList = this.getAllItem();
    if (
      itemList.length == 0 ||
      index == undefined ||
      index < 0 ||
      text == undefined ||
      text.length == 0 ||
      index >= itemList.length
    ) {
      $console.error({
        _: "removeItem",
        message: "itemList,text"
      });
      return false;
    }
    $console.info({
      itemList
    });
    if (itemList[index] == text) {
      switch (index) {
        case 0:
          itemList.shift();
          break;
        case itemList.length - 1:
          itemList.pop();
          break;
        default:
          const listLeft = itemList.slice(0, index + 1),
            listRight = itemList.slice(index, itemList.length - 1);
          itemList = listLeft.concat(listRight);
      }
      $console.info({
        itemList
      });
      if (itemList.length == 0) {
        const result = this.clearItemList();
        if (result.result != true) {
          $console.info({
            _: "removeItem",
            result
          });
        }
        return result.result;
      } else {
        return this.setItemList(itemList);
      }
    } else {
      $console.error({
        _: "removeItem",
        message: "itemList[index] != text"
      });
      return false;
    }
  }
  setItemList(itemListData) {
    $console.info({
      itemListData
    });
    if (itemListData == undefined) {
      $console.error({
        _: "setItemList",
        message: "length"
      });
      return false;
    } else if (itemListData.length == 0) {
      return this.clearItemList();
    } else {
      try {
        const result = this.Sqlite.setItem(
          this.SQLITE_KEY.item_list,
          JSON.stringify(itemListData)
        );
        $console.info({
          result,
          itemListData
        });
        if (result) {
          if ($ui.get("list_item") != undefined) {
            $ui.get("list_item").data = itemListData;
          }
        }
        return result;
      } catch (error) {
        $console.error(error);
        return false;
      }
    }
  }
}
class ClipboardView {
  constructor(mod) {
    this.Mod = mod;
    this.Core = new ClipboardCore(mod);
  }
  inputText(cliboardData) {
    $input.text({
      type: $kbType.text,
      placeholder: "",
      text: cliboardData,
      handler: text => {
        if (text.length == 0) {
          $ui.error("请输入内容");
        } else {
          const result = this.Core.addItem(text);
          if (result) {
            $ui.success("添加成功");
          } else {
            $ui.error("添加失败");
          }
        }
      }
    });
  }
  init() {
    const itemList = this.Core.getAllItem();
    if (itemList == undefined || itemList.length == 0) {
      $ui.alert({
        title: "空白剪切板",
        message: "请添加内容",
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          },
          {
            title: "添加",
            handler: () => {
              this.inputText();
            }
          }
        ]
      });
    } else {
      $ui.push({
        props: {
          title: "剪切板",
          navButtons: [
            {
              title: "菜单",
              symbol: "list.bullet",
              menu: {
                title: "剪切板",
                pullDown: true,
                asPrimary: true,
                items: [
                  {
                    title: "输入",
                    handler: sender => {
                      this.inputText();
                    }
                  },
                  {
                    title: "粘贴",
                    handler: sender => {
                      this.inputText($clipboard.text);
                    }
                  }
                ]
              }
            }
          ]
        },
        views: [
          {
            type: "list",
            props: {
              data: itemList,
              id: "list_item",
              actions: [
                {
                  title: "delete",
                  color: $color("gray"), // default to gray
                  handler: (sender, indexPath) => {
                    const result = this.Core.setItemList(sender.data);
                    if (result == true) {
                      $ui.success("删除成功");
                    } else {
                      $ui.error("删除失败");
                    }
                  }
                },
                {
                  title: "分享",
                  disabled: true,
                  handler: (sender, indexPath) => {
                    $share.sheet([itemList[indexPath.row]]);
                  }
                }
              ]
            },
            layout: $layout.fill,
            events: {
              didSelect: (sender, indexPath, data) => {}
            }
          }
        ]
      });
    }
  }
}
class Clipboard extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "clipboard",
      modName: "剪切板",
      version: "1",
      author: "zhihaofans",
      coreVersion: 10,
      useSqlite: true,
      allowWidget: true,
      allowApi: true
    });
    this.$ = $;
    this.Http = $.http;
    this.Storage = app.Storage;
    this.Ui = new ClipboardView(this);
  }
  run() {
    this.Ui.init();
  }
  runWidget(widgetId) {
    $widget.setTimeline({
      render: ctx => {
        return {
          type: "text",
          props: {
            text: widgetId || this.MOD_INFO.title
          }
        };
      }
    });
  }
  runApi({ apiId, data, callback }) {}
}
module.exports = Clipboard;
