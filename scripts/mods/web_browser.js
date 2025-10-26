const { ModCore } = require("CoreJS"),
  $ = require("$"),
  Next = require("Next");
class BrowserCore {
  constructor(mod) {
    this.Mod = mod;
    this.CONFIG = mod.CONFIG;
  }
  goUrl() {
    const oldUrl = $ui.get("web_browser").url;
    $input.text({
      type: $kbType.url,
      placeholder: "",
      text: oldUrl,
      handler: newUrl => {
        if (newUrl.length > 0 && newUrl != oldUrl) {
          $ui.get("web_browser").url = newUrl;
        }
      }
    });
  }
  openWeb(url = this.CONFIG.WEB_HOMEPAGE) {
    this.showWebView({ url });
  }
  showWebView({ url, header, body, decideNavigation, didClose }) {
    $ui.push({
      props: {
        title: this.Mod.MOD_INFO.title,
        id: "view_webbrowser",
        navButtons: [
          {
            title: "菜单",
            symbol: "list.bullet",
            menu: {
              title: "网页浏览器",
              pullDown: true,
              asPrimary: true,
              items: [
                {
                  title: "输入链接",
                  handler: sender => {
                    //$console.info($ui.get("web_browser"));
                    this.goUrl();
                  }
                }
              ]
            }
          }
        ]
      },
      views: [
        {
          type: "web",
          props: {
            id: "web_browser",
            request: {
              url,
              method: "GET"
            }
          },
          layout: $layout.fill,
          events: {
            decideNavigation:
              decideNavigation ||
              function (sender, action) {
                //可以决定是否加载网页，用于拦截某些请求
                if (
                  !action.requestURL.startsWith("https://") &&
                  !action.requestURL.startsWith("http://")
                ) {
                  $ui.error("已拦截非法链接");
                  $ui.title = sender.title;
                  return false;
                }
                return true;
              },
            didFail: (sender, navigation, error) => {
              $ui.title = "加载失败";
              $console.error(error);
            },
            didFinish: (sender, navigation) => {
              $ui.title = sender.title;
            },
            didStart: (sender, navigation) => {
              $ui.title = "加载中...";
            },
            didClose: didClose || function (sender) {}
          }
        }
      ]
    });
  }
}

class WebBrowser extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "web_browser",
      modName: "网页浏览器",
      version: "1",
      author: "zhihaofans",
      coreVersion: 10,
      allowApi: true,
      iconName: "globe"
    });
    this.$ = $;
    this.Http = $.http;
    this.Storage = Next.Storage;
    this.CONFIG = {
      WEB_HOMEPAGE: "https://baidu.com"
    };
    this.browserCore = new BrowserCore(this);
  }
  run() {
    //$ui.success("run");
    this.browserCore.openWeb();
  }
  runApi({ apiId, data, callback }) {
    //TODO:允许其他Mod调用
    switch (apiId) {
      case "web_browser.openurl":
        this.browserCore.showWebView({
          url: data.url,
          header: data.header,
          decideNavigation: data.decideNavigation,
          didClose: sender => callback(sender)
        });
        break;
      default:
    }
  }
}
module.exports = WebBrowser;
