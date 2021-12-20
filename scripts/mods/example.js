const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(core) {
    this.core = core;
    this.kernel = core.kernel;
    this.http = new core.Http(5);
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
    listKit.pushString(this.core.MOD_NAME, mainViewList, didSelect);
  }
}

class Example extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      modName: "例子",
      version: "5",
      author: "zhihaofans",
      needCoreVersion: 2,
      databaseId: "example",
      keychainId: "example"
    });
    this.kernel = kernel;
  }
  run() {
    $ui.success("run");
    const main = new Main(this);
    main.init();
  }
}
module.exports = Example;
