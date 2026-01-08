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
          darkKeyboard: true
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
    this.Storage = Storage;
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
