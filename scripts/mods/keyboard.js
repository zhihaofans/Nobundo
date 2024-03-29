const { ModCore } = require("CoreJS"),
  $ = require("$"),
  Next = require("Next");

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
  addSpaceInEveryText() {
    const oldText = $keyboard.selectedText;
    if (oldText.length > 0) {
      this.addText(oldText.split("").join(" "));
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
      try {
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
      } catch (error) {
        $console.error(error);
        $ui.alert({
          title: "发生错误",
          message: JSON.stringify(error) || error.message,
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
  getSelectText() {
    if (this.hasText()) {
      return $keyboard.selectedText;
    } else {
      return undefined;
    }
  }
}
class MainView {
  constructor(mod) {
    this.Mod = mod;
  }
  showClipboardView(clipData) {
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
                rows: ["复制到剪切板"]
              },
              {
                title: "剪切板",
                rows: clipData
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
                          this.Mod.App.modLoader.runModApi({
                            modId: "clipboard",
                            apiId: "clipboard.add_item",
                            data: {
                              text
                            },
                            callback: result => {
                              if (result == true) {
                                $ui.success("复制成功,请重新进入");
                              } else {
                                $ui.error("复制失败");
                              }
                            }
                          });
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
                          $ui.error("自己去剪切板mod删");
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
                  try {
                    this.Mod.App.modLoader.runModApi({
                      modId: "clipboard",
                      apiId: "clipboard.get_all_item",
                      callback: data => this.showClipboardView(data)
                    });
                  } catch (error) {
                    $console.error(error);
                    $ui.alert({
                      title: "加载剪切板失败",
                      message: error.message,
                      actions: [
                        {
                          title: "OK",
                          disabled: false, // Optional
                          handler: () => {}
                        },
                        {
                          title: "Cancel",
                          handler: () => {}
                        }
                      ]
                    });
                  } finally {
                    $console.info("showClipboardView finally");
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
class KeyBoardView {
  constructor(mod) {
    this.Mod = mod;
  }
  importSelectText() {
    const text = this.Mod.Core.getSelectText();
    if (text != undefined && text.length > 0) {
      try {
        this.Mod.App.modLoader.runModApi({
          modId: "clipboard",
          apiId: "clipboard.add_item",
          data: {
            text
          },
          callback: result => {
            if (result == true) {
              $ui.success("复制成功,请重新进入剪切板");
            } else {
              $ui.error("复制失败");
            }
          }
        });
      } catch (error) {
        $console.error(error);
        $ui.error("发生内部错误");
      }
    }
  }
  importClipboard() {
    const text = $clipboard.text;
    if (text != undefined && text.length > 0) {
      try {
        this.Mod.App.modLoader.runModApi({
          modId: "clipboard",
          apiId: "clipboard.add_item",
          data: {
            text
          },
          callback: result => {
            if (result == true) {
              $ui.success("复制成功,请重新进入剪切板");
            } else {
              $ui.error("复制失败");
            }
          }
        });
      } catch (error) {
        $console.error(error);
        $ui.error("发生内部错误");
      }
    }
  }
  showClipboardView(clipData) {
    $ui.push({
      props: {
        title: "剪切板",
        navBarHidden: true
      },
      views: [
        {
          type: "list",
          props: {
            data: [
              {
                title: "功能",
                rows: ["从系统剪切板复制", "复制所选文本"]
              },
              {
                title: "剪切板(旧▶新)",
                rows: clipData || []
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
                      this.importClipboard();
                      break;
                    case 1:
                      this.importSelectText();
                      break;
                    default:
                  }

                  break;
                case 1:
                  this.Mod.Core.addText(clipData[row]);
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
    $ui.render({
      views: [
        {
          type: "list",
          props: {
            data: [
              {
                title: "键盘模式",
                rows: [
                  "清空空格",
                  "数学计算",
                  "数学计算并替换为结果",
                  "剪切板",
                  "收起键盘⬇️",
                  "空格说话模式"
                ]
              }
            ]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const row = indexPath.row;
              switch (row) {
                case 0:
                  this.Mod.Core.clearAllSpace();
                  break;
                case 1:
                  this.Mod.Core.mathComputing(false);
                  break;
                case 2:
                  this.Mod.Core.mathComputing(true);
                  break;
                case 3:
                  try {
                    this.Mod.App.modLoader.runModApi({
                      modId: "clipboard",
                      apiId: "clipboard.get_all_item",
                      callback: data => this.showClipboardView(data)
                    });
                  } catch (error) {
                    $ui.error("加载剪切板失败");
                  }
                  break;
                case 4:
                  $keyboard.dismiss();
                  break;
                case 5:
                  this.Mod.Core.addSpaceInEveryText();
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
      version: "3",
      author: "zhihaofans",
      allowKeyboard: true,
      iconName: "keyboard",
      coreVersion: 9
    });
    this.Http = $.http;
    this.Storage = Next.Storage;
    this.Core = new KeyBoardCore(this);
  }
  run() {
    new MainView(this).init();
  }
  runKeyboard() {
    new KeyBoardView(this).init();
  }
}
module.exports = KeyBoard;
