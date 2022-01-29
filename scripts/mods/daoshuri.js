const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(core) {
    this.Core = core;
    this.Kernel = core.kernel;
    this.Http = new core.Http(5);
    this.$ = core.$;
  }
  init() {
    const mainViewList = ["example 1"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          default:
            $ui.alert({
              title: indexPath.row,
              message: data,
              actions: [
                {
                  title: "OK",
                  disabled: false, // Optional
                  handler: () => {}
                }
              ]
            });
        }
      };
    listKit.pushString(this.Core.MOD_NAME, mainViewList, didSelect);
  }
  testView() {
    const dataPicker = {
      type: "date-picker",
      layout: make => {
        make.left.top.right.equalTo(0);
      }
    };
  }
}

class Daoshuri extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      modName: "倒数日",
      version: "1",
      author: "zhihaofans",
      needCoreVersion: 3,
      databaseId: "daoshuri",
      keychainId: "daoshuri"
    });
  }
  run() {
    $ui.success("run");
    const main = new Main(this);
    main.init();
  }
}
module.exports = Daoshuri;
