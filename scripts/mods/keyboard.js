const { ModCore } = require("../../Core.js/core");
class KeyBoardCore {
  constructor(mod) {
    this.Mod = mod;
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
      coreVersion: 6
    });
    this.Core = new KeyBoardCore(this);
  }
  run() {
    //    $ui.success("run");
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
                title: "test",
                rows: ["test"]
              }
            ]
          },
          layout: $layout.fill,
          events: {
            didSelect: (_sender, indexPath, _data) => {
              const row = indexPath.row;
            }
          }
        }
      ]
    });
  }
}
module.exports = KeyBoard;
