const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(core) {
    this.core = core;
    this.kernel = core.kernel;
    this.http = new core.$_.Http();
  }
  initView() {
    const main_view_list = ["时间线"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.getTimeLine();
            break;
        }
      };
    listKit.pushString(this.core.MOD_NAME, main_view_list, didSelect);
  }
  async getTimeLine() {
    $ui.loading(true);
    const number = 50,
      page = 1,
      api_url = `https://api.cportal.cctv.com/api/rest/articleInfo/getScrollList?n=${number}&version=1&p=${page}&app_version=810`,
      http_result = await this.http.get(api_url);
    $ui.loading(false);
    if (http_result.error) {
      this.kernel.error(http_result);
      $ui.error(http_result.error.message);
    } else {
      const result_data = http_result.data,
        time_line = result_data.itemList;
      listKit.pushString(
        "CCTV时间线",
        time_line.map(news => news.itemTitle),
        (sender, indexPath, data) => {
          const this_news = time_line[indexPath.row];
          this.kernel.info(this_news);
          this.core.AppScheme.Browser.Safari.ReadMode(
            `http://app.cctv.com/special/cportal/detail/arti/index.html?id=${this_news.itemID}`
          );
        }
      );
    }
  }
}

class CCTV extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      mod_name: "CCTV客户端",
      version: "1",
      author: "zhihaofans",
      need_database: false,
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
