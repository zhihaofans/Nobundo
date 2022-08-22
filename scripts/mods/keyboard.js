const { ModCore } = require("../../Core.js/core");
class KeyBoardCore {
  constructor(mod) {
    this.Mod = mod;
  }
  addText(text) {
    $keyboard.insert(text);
  }
}

class KeyBoard extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "keyboard",
      modName: "键盘输入法",
      version: "1",
      author: "zhihaofans",
      coreVersion: 7
    });
    this.Core = new KeyBoardCore(this);
    this.App = app;
    this.$ = app.$;
    this.Http = app.$.http;
    this.Storage = app.Storage;
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
                rows: ["换行"]
              }
            ]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const row = indexPath.row;
              switch (row) {
                case 0:
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
