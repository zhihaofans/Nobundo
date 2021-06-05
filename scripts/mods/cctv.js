const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  list = new uiKit.ListKit();
class Main {
  constructor(core) {
    this.core = core;
    this.kernel = core.kernel;
  }
  initView() {
    const main_view_list = ["时间线"],
      didSelect = () => {};
    list.pushString("CCTV客户端", main_view_list, didSelect);
  }
}

class CCTV extends Core {
  constructor(kernel) {
    super({
      mod_name: "CCTV客户端",
      version: "1",
      author: "zhihaofans",
      need_database: true,
      need_core_version: 1,
      database_id: "cctv_app"
    });
    this.kernel = kernel;
  }
  run() {
    const main = new Main(this);
    main.initView();
  }
}
module.exports = CCTV;
