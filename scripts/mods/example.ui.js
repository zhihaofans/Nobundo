const { CoreModule } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(mod) {
    this.Mod = mod;
    this.$ = this.Mod.$;
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
    listKit.pushString(this.Mod.MOD_INFO.NAME, mainViewList, didSelect);
  }
}

class ExampleModule extends CoreModule {
  constructor(mod) {
    super({
      modId: "example",
      moduleId: "example.ui",
      moduleName: "例子ui",
      version: "1a"
      //author: "zhihaofans"
    });
    this.Mod = mod;
  }
  initUi() {
    $ui.success("run");
    const main = new Main(this.Mod);
    main.init();
  }
}
module.exports = ExampleModule;
