const { CoreModule } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class User {
  constructor(core) {
    this.Core = core;
    this.$ = core.$;
  }
}

class BilibiliUser extends CoreModule {
  constructor(core) {
    super({
      coreId: "bilibili",
      moduleId: "bilibili.user",
      moduleName: "哔哩哔哩用户模块",
      version: "1",
      author: "zhihaofans"
    });
    this.Core = core;
    this.User = new User(core);
  }
  initUi() {
    $ui.success("run");
  }
}
module.exports = BilibiliUser;
