const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(core) {
    this.Core = core;
    this.Kernel = core.kernel;
    this.Http = new core.Http(5);
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
}

class Downloader extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      modName: "下载器",
      version: "1",
      author: "zhihaofans",
      needCoreVersion: 3,
      databaseId: "downloader",
      keychainId: "downloader"
    });
  }
  run() {
    $ui.success("run");
    const main = new Main(this);
    main.init();
  }
}
module.exports = Downloader;
