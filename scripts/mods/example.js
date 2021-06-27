const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(name) {
    this.NAME = name;
  }
}

class Example extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      mod_name: "例子",
      version: "1",
      author: "zhihaofans",
      need_database: true,
      need_core_version: 1,
      database_id: "example"
    });
    this.kernel = kernel;
  }
  run() {
    $ui.success("run")
  }
}
module.exports = Example;
