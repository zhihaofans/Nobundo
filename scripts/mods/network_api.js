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
  load(key) {
    return $cache.get(key);
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
}

class MxnzpCore {
  constructor(mod) {
    this.Mod = mod;
    this.Keychain = mod.Keychain;
    this.Cache = new CacheData(mod);
    this.SQLITE_ID = {
      APP_ID: "app_id",
      APP_SECRET: "app_secret"
    };
  }
  getApikey() {
    const app_id = this.Keychain.get(this.SQLITE_ID.APP_ID),
      app_secret = this.Keychain.get(this.SQLITE_ID.APP_SECRET);
    return {
      app_id,
      app_secret
    };
  }
  setApikey({ app_id, app_secret }) {
    if (app_id.length > 0 && app_secret.length > 0) {
      this.Keychain.set(this.SQLITE_ID.APP_ID, app_id);
      this.Keychain.set(this.SQLITE_ID.APP_SECRET, app_secret);
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
    const { app_id, app_secret } = this.getApikey();
    if (app_id != undefined && app_secret != undefined) {
      const url = `https://www.mxnzp.com/api/holiday/single/${date}?ignoreHoliday=false`,
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
          chineseCalendarData.typeDes,
          `${chineseCalendarData.yearTips}年${chineseCalendarData.lunarCalendar}(${chineseCalendarData.chineseZodiac})`,
          `忌${chineseCalendarData.avoid}`,
          `宜${chineseCalendarData.suit}`
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
    $ui.menu({
      items: ["设置apikey", "小组件"],
      handler: (title, idx) => {
        switch (idx) {
          case 0:
            const apiKey = this.mxnzp.getApikey();
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
