const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class BossPage {
  constructor(core) {
    this.core = core;
    this.kernel = core.kernel;
    this.http = new core.$_.Http();
  }
  async productTopDaily(date, cookies) {
    const url = "http://hby.fybhk.com/hby/dreport/product_top10",
      postData = `d_start=${date}&d_end=${date}`,
      header = {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.9(0x18000927) NetType/WIFI Language/zh_CN",
        Referer:
          "http://hby.fybhk.com/modules/hby/reports/day.html?id=516&v=2021072305",
        Accept: "application/json, text/javascript, */*; q=0.01",
        Cookie: cookies
      };
    const postResult = await this.http.post(url, postData, header);
  }
}

class Main {
  constructor(core) {
    this.core = core;
    this.kernel = core.kernel;
    this.http = new core.$_.Http();
    this.bossPage = new BossPage(core);
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

class Haobuye extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      mod_name: "好布业",
      version: "1",
      author: "zhihaofans",
      need_database: false,
      need_core_version: 1,
      database_id: "haobuye"
    });
    this.kernel = kernel;
  }
  run() {
    const main = new Main(this);
    main.init();
  }
}
module.exports = Haobuye;
