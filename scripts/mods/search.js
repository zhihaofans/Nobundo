const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$"),
  { Http, Storage } = require("Next");
class SearchView {
  constructor(mod) {
    this.Mod = mod;
    this.Api = this.Mod.ModuleLoader.getModule("search.api");
    this.API_SITE_LIST = this.Api.getApiList();
    this.SEARCH_SITE_ID = this;
    this.SEARCH_TYPE_LIST = Object.keys(this.API_SITE_LIST).map(site => {
      return {
        id: site,
        title: this.API_SITE_LIST[site].title
      };
    }) || [
      {
        id: "douyin",
        title: "抖音_"
      }
    ];
    this.SEARCH_SITE_ID = this.SEARCH_TYPE_LIST[0].id;
  }
  getHistoryData() {
    try {
      const historyData = this.Mod.Keychain.get("search.history.list") || "[]";
      return JSON.parse(historyData);
    } catch (error) {
      $console.error(error);
      return [];
    }
  }
  setHistoryData(newData) {
    if ($.isArray(newData)) {
      return this.Mod.Keychain.set(
        "search.history.list",
        JSON.stringify(newData)
      );
    } else {
      return false;
    }
  }
  loadHistory() {
    const hisExp = ["搜索历史1"],
      his = Array(10)
        .fill(0)
        .flatMap(() => hisExp);
    $console.info(his);
    $ui.get("list_history").data = this.getHistoryData() || his;
    $ui.title = `搜索(历史${$ui.get("list_history").data.length})`;
  }
  init() {
    const ViewData = [
      {
        type: "menu",
        props: {
          id: "menu_type",
          items: this.SEARCH_TYPE_LIST.map(it => it.title),
          dynamicWidth: true // dynamic item width, default is false
        },
        layout: make => {
          make.left.top.right.equalTo(0);
          make.height.equalTo(44);
        },
        events: {
          changed: sender => {
            const items = sender.items;
            const index = sender.index;
            this.SEARCH_SITE_ID = this.SEARCH_TYPE_LIST[index].id.toLowerCase();
          }
        }
      },
      {
        type: "input",
        props: {
          id: "input_search",
          type: $kbType.search,
          darkKeyboard: true,
          placeholder: "回车搜索"
        },
        layout: (make, view) => {
          make.top.equalTo($ui.get("menu_type").bottom).offset(10);
          make.left.equalTo(10);
          make.right.equalTo(-10);
          make.height.equalTo(44);
        },
        events: {
          returned: sender => {
            const keyword = sender.text;
            if ($.isEmpty(keyword) == false) {
              $.startLoading();
              const oldHistory = this.getHistoryData();
              if (!oldHistory.includes(keyword)) {
                oldHistory.push(keyword);
                this.setHistoryData(oldHistory);
                this.loadHistory();
              }
              this.Api.Api.search(this.SEARCH_SITE_ID, keyword).then(
                su => {
                  $.stopLoading();
                },
                fail => {
                  $.stopLoading();
                  $ui.alert({
                    title: "搜索失败",
                    message: fail,
                    actions: [
                      {
                        title: "OK",
                        disabled: false, // Optional
                        handler: () => {}
                      }
                    ]
                  });
                }
              );
            }
          }
        }
      },
      {
        type: "list",
        props: {
          id: "list_history",
          data: ["加载中"]
        },
        layout: (make, view) => {
          $console.info(view);
          make.top.equalTo($ui.get("input_search").bottom).offset(5);
          make.left.right.equalTo(0);
          make.bottom.equalTo(view.super.bottom);
        },
        events: {
          ready: () => {
            this.loadHistory();
          }
        }
      }
    ];
    $.showView({
      props: {
        title: "搜索"
      },
      views: [
        {
          type: "view",
          layout: $layout.fillSafeArea,
          views: ViewData
        }
      ]
    });
  }
}
class Search extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "search",
      modName: "搜索",
      version: "1",
      author: "zhihaofans",
      coreVersion: 18,
      useSqlite: false,
      allowWidget: false,
      allowApi: false,
      iconName: "command"
    });
    this.ModuleLoader = new ModuleLoader(this);
    this.ModuleLoader.addModule("search.api.js");
    this.View = new SearchView(this);
  }
  run() {
    try {
      this.View.init();
    } catch (error) {
      $console.error(error);
    }
    //$ui.success("run");
  }
  runApi({ apiId, data, callback }) {
    $console.info({
      apiId,
      data,
      callback
    });
    switch (apiId) {
      case "example.ui":
        this.ModuleLoader.getModule("example.ui").initUi();

        break;
      default:
    }
  }
}
module.exports = Search;
