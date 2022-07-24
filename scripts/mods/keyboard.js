const { ModCore } = require("../../Core.js/core");
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
  }
  run() {
    $ui.success("run");
  }
}
module.exports = KeyBoard;
