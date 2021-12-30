const APP_INFO = {
    UA: "NanDu/6.3.3 (iPhone; iOS 14.7; Scale/2.00)"
  },
  { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Home {
  constructor(core) {
    this.Core = core;
    this.Http = new core.$_.Http();
  }
  async getTodayHotNews() {
    this.Kernel.info("getTodayHotNews", "1");
    $ui.loading(true);
    const api_url = `https://api-ndapp.oeeee.com/friends.php?m=Home&a=hot`,
      http_result = await this.Http.get(api_url);
    $ui.loading(false);
    if (http_result.error) {
      this.Kernel.error(http_result);
      $ui.error(http_result.error.message);
    } else {
      const result_data = http_result.data;
      this.Kernel.info(result_data);
      if (result_data.errcode === 0) {
        const result_item_list = result_data.data,
          str_list = result_item_list.map(item => item.title),
          didSelect = (sender, indexPath, data) => {
            const thisNewsItem = result_item_list[indexPath.row];
            this.Core.AppScheme.Browser.Safari.ReadMode(thisNewsItem.url);
          };
        listKit.pushString("24小时热榜", str_list, didSelect);
      } else {
        this.Kernel.error(result_data.errmsg);
      }
    }
  }
}

class AppView {
  constructor(core) {
    this.Core = core;
    this.home = new Home(core);
  }
  init() {
    const main_view_list = ["热榜新闻"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.home.getTodayHotNews();
            break;
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
    listKit.pushString(this.Core.MOD_NAME, main_view_list, didSelect);
  }
}

class NanDu extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      modName: "南方都市报",
      version: "2",
      author: "zhihaofans",
      needCoreVersion: 3
    });
  }
  run() {
    try {
      const view = new AppView(this);
      view.init();
    } catch (_error) {
      this.Kernel.error("NanDu.run", _error);
      $ui.loading(false);
      $ui.alert({
        title: "error message",
        message: _error.message,
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: function () {}
          }
        ]
      });
    }
  }
}
module.exports = NanDu;
