const { ModModule } = require("CoreJS"),
  HttpLib = require("HttpLib"),
  $ = require("$");
class CheckIn {
  constructor(mod) {
    this.Auth = mod.ModuleLoader.getModule("bilibili.auth");
  }
  liveCheckIn() {
    return new Promise((resolve, reject) => {
      const url = "https://api.live.bilibili.com/rc/v1/Sign/doSign";
      try {
        $console.info("trystart");
        const http = new HttpLib(url);
        http.setCookie(this.Auth.getCookie());
        http
          .get()
          .then(resp => {
            if (resp.isError != false) {
              reject(resp.errorMessage || "未知错误");
            } else {
              const result = resp.data;
              if (result.code === 0) {
                resolve(result.msg || `code${result.code}`);
              } else {
                reject(result.msg || "未知错误");
              }
            }
          })
          .catch(fail => reject(fail));
        $console.info("try");
      } catch (error) {
        $console.error(error);
        reject(error);
      }
    });
  }
  mangaCheckIn() {
    return new Promise((resolve, reject) => {
      const url =
        "https://manga.bilibili.com/twirp/activity.v1.Activity/ClockIn?platform=android";
      try {
        new HttpLib(url).post().then(resp => {
          if (resp.isError != false) {
            reject(resp.errorMessage || "未知错误");
          } else {
            const result = resp.data;
            if (result.code === 0) {
              resolve(result.msg || `code${result.code}`);
            } else {
              reject(result.msg || "未知错误");
            }
          }
        });
      } catch (error) {
        $console.error(error);
        reject(error.message);
      }
    });
  }
}
class BiliModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.checkin",
      name: "哔哩哔哩签到",
      version: "1"
    });
    this.CheckIn = new CheckIn(mod);
  }
  init() {
    $ui.push({
      props: {
        title: "哔哩签到"
      },
      views: [
        {
          type: "list",
          props: {
            data: ["漫画签到"]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              switch (indexPath.row) {
                case 0:
                  $.startLoading();
                  this.CheckIn.mangaCheckIn().then(
                    resu => {
                      $.stopLoading();
                      $ui.success(resu);
                    },
                    fail => {
                      $.stopLoading();
                      $ui.error(fail);
                    }
                  );
                  break;
                default:
              }
            }
          }
        }
      ]
    });
  }
}

module.exports = BiliModule;
