const { ModCore } = require("CoreJS"),
  $ = require("$"),
  ClipLib = require("ClipboardLib");
class ClipboardCore {
  constructor(mod) {
    this.Mod = mod;
    this.Lib = new ClipLib();
  }
  addItem(text) {
    return this.Lib.addItem(text);
  }
  clearItemList() {
    return this.Lib.removeData();
  }
  getAllItem() {
    return this.Lib.getList();
  }
  removeItem(index, text) {
    return false;
    const oldList = this.getAllItem();
    if (index >= oldList.length) {
      return false;
    } else {
      const newList = oldList.filter((element, idx, array) => {
        return idx !== index && text !== element;
      });
      return this.setItemList(newList);
    }
  }
  setItemList(itemListData) {
    return this.Lib.setList(itemListData);
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
              this.inputText($.paste());
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
      version: "3",
      author: "zhihaofans",
      coreVersion: 13,
      useSqlite: true,
      allowWidget: true,
      allowApi: true,
      iconName: "doc.on.clipboard"
    });
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
  runApi({ apiId, data, callback }) {
    try {
      const Core = new ClipboardCore(this);
      switch (apiId) {
        case "clipboard.get_all_item":
          if ($.isFunction(callback)) {
            callback(Core.getAllItem());
          } else {
            return Core.getAllItem();
          }
          break;
        case "clipboard.add_item":
          //data:{text:"要添加到剪切板的文本"}
          const success =
            data == undefined || data.text == undefined
              ? false
              : Core.addItem(data.text);
          if ($.isFunction(callback)) {
            callback(success);
          } else {
            return callback(success);
          }
          break;
        default:
      }
    } catch (error) {
      $console.error(error);
      return;
    }
  }
}
module.exports = Clipboard;
