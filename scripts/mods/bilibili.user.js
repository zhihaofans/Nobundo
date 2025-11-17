const { ModModule } = require("CoreJS"),
  $ = require("$"),
  HttpLib = require("HttpLib");
class LiveCore {
  constructor(mod) {
    this.Auth = mod.ModuleLoader.getModule("bilibili.auth");
  }
  getUserInfo() {
    return new Promise((resolve, reject) => {
      const url =
        "https://api.live.bilibili.com/xlive/web-ucenter/user/get_user_info";
      try {
        $console.info("trystart");
        new HttpLib(url)
          .cookie(this.Auth.getCookie())
          .get()
          .then(
            resp => {
              if (resp.isError) {
                reject(resp.errorMessage);
              } else {
                resolve(resp.data);
              }
            },
            fail => reject(fail)
          );
        $console.info("try");
      } catch (error) {
        $console.error(error);
        reject(error);
      }
    });
  }
}
class UserCore {
  constructor(mod) {
    this.Auth = mod.ModuleLoader.getModule("bilibili.auth");
  }
  getNavData(rawData = false) {
    return new Promise((resolve, reject) => {
      const url = "https://api.bilibili.com/x/web-interface/nav";
      try {
        $console.info("trystart");

        const http = new HttpLib(url);
        http.cookie(this.Auth.getCookie());
        http
          .get()
          .then(result => {
            if (result.resp_is_undefined || result.isError) {
              reject(result.errorMessage || "resp_is_undefined?");
            } else {
              resolve(result.data);
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
}
class UserView {
  constructor(mod) {
    this.ModuleLoader = mod.ModuleLoader;
    this.User = new UserCore(mod);
    this.Live = new LiveCore(mod);
  }
  initView(resultData) {
    const History = this.ModuleLoader.getModule("bilibili.history");
    const moneyTemplate = [
        {
          type: "label",
          props: {
            id: "labelNumber",
            font: $font(20),
            align: $align.center
          },
          layout: $layout.fill
        },
        {
          type: "label",
          props: {
            id: "labelTitle",
            font: $font(16),
            align: $align.center
          },
          layout: (make, view) => {
            make.bottom.inset(0);
            make.centerX.equalTo(view.super);
          }
        }
      ],
      moneyData = [
        {
          labelNumber: {
            text: "..."
          },
          labelTitle: {
            text: "B币"
          }
        },
        {
          labelNumber: {
            text: Number(resultData.billCoin).toFixed(2) || "无"
          },
          labelTitle: {
            text: "硬币"
          }
        },
        {
          labelNumber: {
            text: Number(resultData.gold / 100) || "?"
          },
          labelTitle: {
            text: "电池"
          }
        }
      ],
      moneyView = {
        type: "matrix",
        props: {
          id: "tabMoney",
          columns: 3,
          itemHeight: 80,
          spacing: 0,
          scrollEnabled: false,
          //bgcolor: $color("clear"),
          template: [
            {
              type: "view",
              props: {
                id: "view_item",
                border: {
                  color: $color("gray"),
                  width: 10
                }
              },
              layout: (make, view) => {
                //make.size.equalTo(view.super);
                make.center.equalTo(view.super);
                make.height.equalTo(80);
              },
              views: moneyTemplate
            }
          ],
          data: moneyData
        },
        layout: (make, view) => {
          //make.bottom.inset(0);
          make.top.greaterThanOrEqualTo($ui.get("labelUname").bottom);
          if ($device.info.screen.width > 500) {
            make.width.equalTo(500);
          } else {
            make.left.right.equalTo(0);
          }
          make.centerX.equalTo(view.super);
          make.height.equalTo(90);
        },
        events: {
          didSelect(sender, indexPath, data) {
            $console.info(indexPath, data);
            switch (indexPath.row) {
              case 2:
                $app.openURL(
                  "https://link.bilibili.com/p/live-h5-recharge/index.html"
                );
                break;
              default:
                $ui
                  .get("tabMoney")
                  .cell($indexPath(0, 0))
                  .get("labelNumber").text = "999";
            }
          }
        }
      },
      historyTabTemplate = [
        {
          type: "image",
          props: {
            id: "imageIcon"
          },
          layout: (make, view) => {
            //make.edges.equalTo(view.super)
            make.center.equalTo(view.super);
            //make.size.equalTo($size(30, 30));
          }
        },
        {
          type: "label",
          props: {
            id: "labelTitle",
            font: $font(16),
            align: $align.center
          },
          layout: (make, view) => {
            make.bottom.inset(0);
            make.centerX.equalTo(view.super);
          }
        }
      ],
      historyTabMenu = [
        {
          text: "收藏",
          icon: "star.fill",
          func: () => History.showFav()
        },
        {
          text: "稍后再看",
          icon: "eye.fill",
          func: () => History.showLaterToWatch()
        },
        {
          text: "历史",
          icon: "gobackward",
          func: () => History.showHistory()
        },
        {
          text: "动态",
          icon: "list.dash",
          func: () => {
            this.ModuleLoader.getModule("bilibili.dynamic").init();
          }
        },
        {
          text: "签到",
          icon: "pencil",
          func: () => {
            this.ModuleLoader.getModule("bilibili.checkin").init();
          }
        }
      ],
      historyTabData = historyTabMenu.map(it => {
        return {
          imageIcon: {
            symbol: it.icon
          },
          labelTitle: {
            text: it.text
          }
        };
      }),
      historyTabView = {
        type: "matrix",
        props: {
          id: "tabHistory",
          columns: 3,
          itemHeight: 80,
          spacing: 0,
          scrollEnabled: false,
          //bgcolor: $color("clear"),
          template: [
            {
              type: "view",
              props: {
                id: "view_item",
                border: {
                  color: $color("gray"),
                  width: 20
                }
              },
              layout: (make, view) => {
                //make.size.equalTo(view.super);
                make.center.equalTo(view.super);
                make.height.equalTo(80);
              },
              views: historyTabTemplate
            }
          ],
          data: historyTabData
        },
        layout: (make, view) => {
          //make.bottom.inset(0);
          make.top.greaterThanOrEqualTo($ui.get("tabMoney").bottom);
          if ($device.info.screen.width > 500) {
            make.width.equalTo(500);
          } else {
            make.left.right.equalTo(0);
          }
          make.centerX.equalTo(view.super);
          make.height.equalTo(180);
        },
        events: {
          didSelect(sender, indexPath, data) {
            $console.info(indexPath, data);
            historyTabMenu[indexPath.row].func();
          },
          ready: () => {
            this.initSecondData();
            //$ui.error("加载B币数据功能完善中");
          }
        }
      },
      viewData = {
        props: {
          title: "我"
        },
        views: [
          {
            type: "scroll",
            layout: $layout.fill,
            views: [
              {
                type: "image",
                props: {
                  src: resultData.face,
                  id: "imageUserCover"
                },
                layout: (make, view) => {
                  make.centerX.equalTo(view.super);
                  make.size.equalTo($size(100, 100));
                  make.top.equalTo(5);
                },
                events: {
                  tapped: (sender, indexPath, data) => {
                    $quicklook.open({
                      url: resultData.face,
                      handler: () => {
                        // Handle dismiss action, optional
                      }
                    });
                  }
                }
              },
              {
                type: "label",
                props: {
                  id: "labelUname",
                  text: resultData.uname,
                  align: $align.center,
                  lines: 1
                },
                layout: (make, view) => {
                  make.centerX.equalTo(view.super);
                  make.top.equalTo($ui.get("imageUserCover").bottom);
                }
              },
              moneyView,
              historyTabView
            ]
          }
        ]
      };
    $ui.push(viewData);
  }
  init() {
    $ui.loading(true);
    this.Live.getUserInfo()
      .then(result => {
        $ui.loading(false);
        $console.info(result);
        if (result.code === 0) {
          this.initView(result.data);
        } else {
          $ui.alert({
            title: "发生错误",
            message: result.message || "可能是网络错误",
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
        }
      })
      .catch(fail => {
        $ui.loading(false);
        $console.info(fail);
        $ui.error(fail.message);
      });
  }
  initSecondData() {
    this.User.getNavData().then(
      result => {
        $ui.loading(false);
        $console.info(result);
        if (result.code === 0) {
          const bCoin =
            Number(result.data.wallet.bcoin_balance).toFixed(2) || "加载失败";

          $ui
            .get("tabMoney")
            .cell($indexPath(0, 0))
            .get("labelNumber").text = bCoin;
        } else {
          $ui.alert({
            title: "发生错误",
            message: result.message || "可能是网络错误",
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
        }
      },
      fail => {
        $ui.loading(false);
        $console.error(fail);
        $ui.error(fail);
      }
    );
  }
}
class BiliModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.user",
      name: "哔哩哔哩用户相关",
      version: "1"
    });
    this.View = new UserView(mod);
  }
  init() {
    this.View.init();
  }
}
module.exports = BiliModule;
