const { ModCore } = require("CoreJS"),
  Next = require("Next"),
  $ = require("$");
class CacheData {
  constructor(mod) {
    this.Mod = mod;
    this.CACHE_ID_LIST = {
      mxnzp_holiday: "mxnzp_holiday"
    };
  }
  remove(key) {
    $cache.remove(key);
  }
  save(key, value) {
    $cache.setAsync({
      key,
      value,
      handler: object => {
        $console.info(object);
      }
    });
  }
  load(key) {
    return $cache.get(key);
  }
}

class MxnzpCore {
  constructor(mod) {
    this.Mod = mod;
    this.SQLITE = mod.SQLITE;
    this.Cache = new CacheData(mod);
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
    const cacheData = this.Cache.load(this.Cache.CACHE_ID_LIST.mxnzp_holiday);
    if (cacheData != undefined) {
      if (cacheData.date == date) {
        return cacheData.data;
      } else {
        this.Cache.remove(this.Cache.CACHE_ID_LIST.mxnzp_holiday);
      }
    }
    const { app_id, app_secret } = this.getApikey(),
      url = `https://www.mxnzp.com/api/holiday/single/${date}?ignoreHoliday=false`,
      header = {
        app_id,
        app_secret
      },
      resp = await this.Mod.Http.get({
        url,
        header
      }),
      result = resp.data;
    if (result && result.code == 1) {
      this.Cache.save(this.Cache.CACHE_ID_LIST.mxnzp_holiday, result.data);
      return result.data;
    } else {
      $console.error(result.msg);
    }
    return undefined;
  }
}
class WidgetView {
  constructor(mod) {
    this.Mod = mod;
    this.Cache = new CacheData(mod);
  }
  async showTodayLunarCalendar() {
    const dateKit = new Next.DateTime(1),
      nowDate = dateKit.getFullDateNumber(),
      chineseCalendarData = await this.Mod.mxnzp.getChineseCalendar(nowDate);
    if (chineseCalendarData == undefined) {
      $widget.setTimeline(ctx => {
        return {
          type: "text",
          props: {
            text: "网络错误"
          }
        };
      });
    } else {
      const resultList = [
          chineseCalendarData.avoid,
          chineseCalendarData.lunarCalendar,
          chineseCalendarData.typeDes,
          `属${chineseCalendarData.chineseZodiac}`,
          `${chineseCalendarData.yearTips}年`
        ],
        randomItem = resultList[Math.floor(Math.random() * resultList.length)];
      $console.info({
        randomItem,
        resultList
      });
      $widget.setTimeline(ctx => {
        return {
          type: "text",
          props: {
            text: randomItem || "showTodayLunarCalendar"
          }
        };
      });
    }
  }
}

class NetworkApi extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "network_api",
      modName: "在线Api",
      version: "1a",
      author: "zhihaofans",
      useSqlite: true,
      allowApi: true,
      allowWidget: true,
      coreVersion: 10
    });
    this.$ = $;
    this.Http = $.http;
    this.mxnzp = new MxnzpCore(this);
    this.widgetView = new WidgetView(this);
  }
  run() {
    const apiKey = this.mxnzp.getApikey();
    $ui.menu({
      items: ["设置apikey", "小组件"],
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
          case 1:
            try {
              this.widgetView.showTodayLunarCalendar();
            } catch (error) {
              $console.error(error);
            }
            break;
          default:
        }
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
  runWidget(widgetId) {
    const widgetView = new WidgetView(this);
    switch (widgetId) {
      case "network_api.mxnzp.today.lunarCalendar":
        widgetView.showTodayLunarCalendar();
        break;
      default:
        $widget.setTimeline({
          render: ctx => {
            return {
              type: "text",
              props: {
                text: "不存在该id"
              }
            };
          }
        });
    }
  }
}
module.exports = NetworkApi;
