const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();

class Jinritoutiao {
  constructor(core) {
    this.Core = core;
    this.$ = core.$;
  }
  init() {
    this.getNews();
  }
  async getNews() {
    $ui.loading(true);
    const url = "https://is.snssdk.com/api/news/feed/v51/",
      resp = await this.$.http.get({ url }),
      response = resp.response;
    $console.info({ resp });
    $ui.loading(false);
    if (resp.error) {
      $ui.alert({
        title: `请求错误(${response.code})`,
        message: resp.error.localizedDescription,
        actions: [
          {
            title: "OK",
            disabled: false,
            handler: () => {}
          }
        ]
      });
    } else {
      const result = resp.data;
      if (result.message == "success") {
        const newsList = result.data,
          didSelect = (sender, indexPath, data) => {
            $console.info({
              indexPath
            });
            const thisPrivilege = privilegeList[indexPath.row];
            if (thisPrivilege.state == 1) {
              $ui.alert({
                title: "领取失败",
                message: privilegeStr[thisPrivilege.type] + "已领取",
                actions: [
                  {
                    title: "OK",
                    disabled: false, // Optional
                    handler: () => {}
                  }
                ]
              });
            } else {
              this.receivePrivilege(thisPrivilege.type);
            }
          };
        listKit.pushString(
          "今日头条",
          newsList.map(news => {}),
          didSelect
        );
      } else {
        $ui.alert({
          title: `请求失败(${result.code})`,
          message: result.message,
          actions: [
            {
              title: "OK",
              disabled: false,
              handler: () => {}
            }
          ]
        });
      }
    }
  }
}

class Main {
  constructor(core) {
    this.Core = core;
    this.Kernel = core.kernel;
    this.$ = core.$;
    this.apiList = [
      {
        id: "jinritoutiao",
        title: "今日头条",
        class: Jinritoutiao,
        func: "init",
        needCore: false
      }
    ];
  }
  init() {
    const didSelect = (sender, indexPath, data) => {
      const thisApi = this.apiList[indexPath.row];
      try {
        const thisClass = new thisApi["class"](this);
        thisClass[thisApi.func]();
      } catch (error) {
        $console.error(error);
        $ui.alert({
          title: error.name,
          message: error.message,
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
    listKit.pushString(
      this.Core.MOD_NAME,
      this.apiList.map(api => api.title),
      didSelect
    );
  }
}

class FreeApi extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      modId: "free_api",
      modName: "免费Api",
      version: "1",
      author: "zhihaofans",
      needCoreVersion: 3,
      keychainId: "free_api"
    });
  }
  run() {
    $ui.success("run");
    const main = new Main(this);
    main.init();
  }
}
module.exports = FreeApi;
