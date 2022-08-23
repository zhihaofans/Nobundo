const { ModCore } = require("../../Core.js/core");
class MxnzpCore {
  constructor(mod) {
    this.Mod = mod;
    this.SQLITE = mod.SQLITE;
  }
  getApikey() {
    return {
      app_id: this.SQLITE.getItem("app_id"),
      app_secret: this.SQLITE.getItem("app_secret")
    };
  }
  setApikey({ app_id, app_secret }) {
    if (app_id.length > 0 && app_secret.length > 0) {
      this.SQLITE.setItem("app_id", app_id);
      this.SQLITE.setItem("app_secret", app_secret);
    }
  }
  async getChineseCalendar(date) {
    const { app_id, app_secret } = this.getApikey(),
      url = `https://www.mxnzp.com/api/holiday/single/${date}?ignoreHoliday=false`,
      header = {
        app_id,
        app_secret
      },
      resp = await this.Mod.Http.get({
        url,
        header
      });
    $console.info({
      resp
    });
    return resp.data;
  }
}

class NetworkApi extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "network_api",
      modName: "在线Api",
      version: "1",
      author: "zhihaofans",
      coreVersion: 7,
      useSqlite: true
    });
    this.$ = app.$;
    this.Http = app.$.http;
    this.mxnzp = new MxnzpCore(this);
  }
  run() {
    const apiKey = this.mxnzp.getApikey();
    $ui.menu({
      items: ["设置apikey"],
      handler: (title, idx) => {
        switch (idx) {
          case 0:
            $input.text({
              type: $kbType.text,
              placeholder: "app_id",
              text: apiKey.app_id || "",
              handler: app_id => {
                if (app_id.length > 0) {
                  $input.text({
                    type: $kbType.text,
                    placeholder: "app_secret",
                    text: apiKey.app_secret || "",
                    handler: app_secret => {
                      if (app_secret.length > 0) {
                        this.mxnzp.setApikey({
                          app_id,
                          app_secret
                        });
                        $console.info(this.mxnzp.getApikey());
                      }
                    }
                  });
                }
              }
            });
            break;
          default:
        }
      }
    });
  }
  runWidget() {
    const inputValue = $widget.inputValue ? `[${$widget.inputValue}]` : "";
    $widget.setTimeline({
      render: ctx => {
        return {
          type: "text",
          props: {
            text: `${inputValue}Hello, network_api!`
          }
        };
      }
    });
  }
  runApi(apiId, data) {
    switch (apiId) {
      case "mxnzp.get_chinese_calendar":
        return this.mxnzp.getChineseCalendar(data);

      default:
        return undefined;
    }
  }
}
module.exports = NetworkApi;
