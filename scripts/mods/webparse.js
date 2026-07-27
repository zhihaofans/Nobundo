const { ModCore, ModuleLoader } = require("CoreJS");
const $ = require("$");
const KEY_LAST_URL = "last_url";
class ParseView {
  constructor(mod) {
    this.Api = mod.Api;
  }
  goto(site, url) {
    site
      .parse(url)
      .then(resu => {})
      .catch(fail => {
        $ui.alert({
          title: "失败",
          message: fail,
          actions: [
            {
              title: "OK",
              disabled: false, // Optional
              handler: () => {}
            },
            {
              title: "Cancel",
              handler: () => {}
            }
          ]
        });
      });
  }
  init(list, url) {
    if ($.isArray(list) && list.length > 0) {
      try {
        $ui.menu({
          items: list.map(i => i.TITLE || i.ID || "未知"),
          handler: (title, idx) => {
            this.goto(list[idx], url);
          }
        });
      } catch (error) {
        $console.error(error);
      }
    } else {
      $ui.alert({
        title: "解析结果错误",
        message: "空白结果或不是列表",
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    }
  }
}
class Example extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "webparse",
      modName: "网页解析",
      version: "1",
      author: "zhihaofans",
      coreVersion: 19,
      useSqlite: true,
      //      allowWidget: true,
      //      allowApi: true,
      iconName: "doc.text.magnifyingglass"
    });

    this.ModuleLoader = new ModuleLoader(this);
    this.ModuleLoader.addModule("webparse.api.js");
    this.Api = this.ModuleLoader.getModule("webparse.api");
    this.View = new ParseView(this);
    this.Api.init();
  }
  run() {
    try {
      $.inputText(this.Keychain.get(KEY_LAST_URL), "输入解析的链接").then(
        url => {
          if (!$.isEmpty(url)) {
            this.Keychain.set(KEY_LAST_URL, url);
            this.Api.parse(url).then(list => {
              this.View.init(list, url);
            });
          }
        }
      );
    } catch (error) {
      $console.error(error);
    }
    //$ui.success("run");
  }
  runWidget(widgetId) {
    $widget.setTimeline({
      render: ctx => {
        return {
          type: "text",
          props: {
            text: widgetId || "Hello!"
          }
        };
      }
    });
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
module.exports = Example;
