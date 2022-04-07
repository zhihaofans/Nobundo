const { CoreModule } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(core) {
    this.Core = core;
    this.Http = new this.Core.Http(5);
    this.$ = this.Core.$;
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

class ExampleModule extends CoreModule {
  constructor(core) {
    super({
      coreId: "example",
      moduleId: "example.ui",
      moduleName: "例子ui",
      version: "1",
      author: "zhihaofans"
    });
    this.Core = core;
  }
  initUi() {
    $ui.success("run");
    const main = new Main(this.Core);
    main.init();
  }
}
module.exports = ExampleModule;
