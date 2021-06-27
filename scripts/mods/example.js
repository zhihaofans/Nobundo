const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(core) {
    this.core = core;
    this.kernel = core.kernel;
    this.http = new core.$_.Http();
  }
  init() {
    const main_view_list = ["example 1"],
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
                  handler: function () {}
                }
              ]
            });
        }
      };
    listKit.pushString(this.core.MOD_NAME, main_view_list, didSelect);
  }
}

class Example extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      mod_name: "例子",
      version: "1",
      author: "zhihaofans",
      need_database: false,
      need_core_version: 1,
      database_id: "example"
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
