const { ModCore } = require("CoreJS");
class MathKit {
  constructor(mod) {
    this.Mod = mod;
    this.$ = mod.$;
    this.MathKit = require("math");
  }
  mathComputing(str) {
    //数学计算
    if (str == undefined || str.length == 0) {
      return undefined;
    }
    return this.MathKit.evaluate(str);
  }
}

class KeyBoardCore {
  constructor(mod) {
    this.Mod = mod;
    this.mathKit = new MathKit(mod);
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
      this.addText(oldText.replace(" ", ""));
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
      const result = this.mathKit.mathComputing(selectText);
      if (result != undefined) {
        if (onlyResult) {
          this.addText(result);
        } else {
          this.addText(selectText + "=" + result);
        }
        this.playClickSound();
      }
    }
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
      coreVersion: 8
    });
    this.$ = app.$;
    this.Http = app.$.http;
    this.Storage = app.Storage;
    this.Core = new KeyBoardCore(this);
  }
  run() {
    //$ui.success("run");
    this.runKeyboard();
  }
  runKeyboard() {
    $ui.render({
      props: {
        title: ""
      },
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
