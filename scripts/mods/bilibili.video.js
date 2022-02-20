const { CoreModule } = require("../../Core.js/core.module"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();

class User {
  constructor({ core }) {
    this.Core = core;
    this.$ = core.$;
    this.Http = new this.Core.Http(5);
  }
  async getLaterToWatch(cookie) {
    $ui.loading(true);
    const url = "https://api.bilibili.com/x/v2/history/toview",
      header = { cookie },
      timeout = 5,
      resp = await this.$.http.get({
        url,
        header,
        timeout
      });
    $console.info({ resp });
    if (resp.error) {
      $ui.loading(false);
      $ui.alert({
        title: "获取失败",
        message: resp.error.message,
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    } else {
      const result = resp.data;
      if (result) {
        if (result.code == 0) {
        } else {
        }
      } else {
      }
    }
  }
}

class BilibiliVideo extends CoreModule {
  constructor(core) {
    super({
      coreId: "bilibili",
      moduleId: "bilibili.video",
      moduleName: "哔哩哔哩视频",
      version: "1",
      author: "zhihaofans"
    });
    this.Core = core;
  }
  getUser() {
    return new User({
      core: this.Core
    });
  }
}
module.exports = BilibiliVideo;
