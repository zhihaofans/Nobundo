const { ModCore } = require("CoreJS"),
  $ = require("$"),
  Next = require("Next");
class ClipboardCore {
  constructor(mod) {
    this.Mod = mod;
    this.Keychain = mod.Keychain;
    this.MAX_LENGTH = 10;
    this.KEYCHAIN_ITEM_LIST = "item_list";
  }
  addItem(str) {
    const itemList = this.getItemList(),
      oldLength = itemList.length;
    itemList.unshift(str);
    const newLength = itemList.length;
    if (newLength == oldLength + 1) {
      return this.setItemList(itemList);
    } else {
      return false;
    }
  }
  getItemList() {
    const dataStr = this.Keychain.getValue(this.KEYCHAIN_ITEM_LIST) || "[]";
    if (dataStr.length > 0) {
      try {
        const listData = JSON.parse(dataStr);
        if (listData == undefined) {
          return [];
        } else {
          return listData.map(item => $text.base64Decode(item)) || [];
        }
      } catch (error) {
        $console.error(error);
        return [];
      }
    } else {
      return [];
    }
  }
  setItemList(listData) {
    $console.warn(listData);
    if (listData.length > 0) {
      return this.Keychain.setValue(
        this.KEYCHAIN_ITEM_LIST,
        JSON.stringify(listData.map(item => $text.base64Encode(item)))
      );
    } else {
      return false;
    }
  }
  clearItemList() {
    return this.Keychain.remove(this.KEYCHAIN_ITEM_LIST);
  }
  removeItemIndex(idx) {
    const itemList = this.getItemList(),
      oldLength = itemList.length;
    if (oldLength == 0) {
      return false;
    } else {
      const oldList = itemList.splice(idx, 1),
        newLength = itemList.length;
      $console.info({
        oldList,
        itemList
      });
      if (newLength == 0) {
        return this.clearItemList();
      } else if (newLength == oldLength - 1) {
        return this.setItemList(itemList);
      } else {
        return false;
      }
    }
  }
}

class KeyBoardCore {
  constructor(mod) {
    this.Mod = mod;
  }
  addText(text) {
    $keyboard.insert(text);
  }
  hasText() {
    return $keyboard.hasText;
  }
  clearAllSpace() {
    const oldText = $keyboard.selectedText;
    if (oldText.length > 0) {
      this.addText(oldText.replaceAll(" ", ""));
    }
    this.playClickSound();
  }
  playClickSound() {
    $keyboard.playInputClick();
  }
  mathComputing(onlyResult = false) {
    const selectText = $keyboard.selectedText;
    if (selectText.length == 0 || selectText.indexOf("=") >= 0) {
      $ui.alert({
        title: "计算失败",
        message: "不是可计算内容或包含等于号",
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    } else {
      const mathKit = new require("math"),
        result = mathKit.evaluate(selectText);
      if (result != undefined) {
        if (onlyResult) {
          this.addText(result);
        } else {
          this.addText(selectText + "=" + result);
        }
        this.playClickSound();
      } else {
        $ui.alert({
          title: "计算出错",
          message: "计算服务返回空白数据",
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
  }
}
class KeyBoardMainView {
  constructor(mod) {
    this.Mod = mod;
    this.clipBoardCore = new ClipboardCore(mod);
  }
  showClipboardView() {
    $ui.push({
      props: {
        title: "剪切板"
      },
      views: [
        {
          type: "list",
          props: {
            data: [
              {
                title: "功能",
                rows: ["粘贴"]
              },
              {
                title: "剪切板",
                rows: this.clipBoardCore.getItemList()
              }
            ]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const section = indexPath.section,
                row = indexPath.row;
              switch (section) {
                case 0:
                  switch (row) {
                    case 0:
                      const text = $clipboard.text;
                      if (text != undefined && text.length > 0) {
                        try {
                          const result = this.clipBoardCore.addItem(text);
                          if (result) {
                            $ui.success("粘贴成功,请重新进入");
                          } else {
                            $ui.error("粘贴失败");
                          }
                        } catch (error) {
                          $console.error(error);
                          $ui.error("发生内部错误");
                        }
                      }
                      break;
                    default:
                  }

                  break;
                case 1:
                  $ui.menu({
                    items: ["删除"],
                    handler: (title, idx) => {
                      switch (idx) {
                        case 0:
                          try {
                            const result = this.clipBoardCore.removeItemIndex(
                              row
                            );
                            if (result) {
                              $ui.success("删除成功,请重新进入");
                            } else {
                              $ui.error("删除失败");
                            }
                          } catch (error) {
                            $console.error(error);
                            $ui.error("发生内部错误");
                          }
                          break;
                        default:
                      }
                    }
                  });
                  break;
                default:
              }
            }
          }
        }
      ]
    });
  }
  init() {
    $ui.push({
      props: {
        title: this.Mod.MOD_INFO.NAME
      },
      views: [
        {
          type: "list",
          props: {
            data: ["设置", "剪切板"]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const section = indexPath.section,
                row = indexPath.row;
              switch (row) {
                case 1:
                  this.showClipboardView();
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

class KeyBoard extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "keyboard",
      modName: "键盘输入法",
      version: "1a",
      author: "zhihaofans",
      allowKeyboard: true,
      coreVersion: 9
    });
    this.$ = $;
    this.Http = $.http;
    this.Storage = Next.Storage;
    this.Core = new KeyBoardCore(this);
  }
  run() {
    const mainView = new KeyBoardMainView(this);
    mainView.init();
  }
  runKeyboard() {
    $ui.render({
      views: [
        {
          type: "list",
          props: {
            data: [
              {
                title: "键盘模式",
                rows: ["清空空格", "数学计算", "数学计算并替换为结果"]
              }
            ]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const row = indexPath.row;
              switch (row) {
                case 0:
                  this.Core.clearAllSpace();
                  break;
                case 1:
                  this.Core.mathComputing(false);
                  break;
                case 2:
                  this.Core.mathComputing(true);
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
module.exports = KeyBoard;
