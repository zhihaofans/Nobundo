const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$");
const COLOR = require("../color");
const moduleList = [
  "bilibili.auth.js",
  "bilibili.login.js",
  "bilibili.checkin.js",
  "bilibili.app.js",
  "bilibili.user.js",
  "bilibili.dynamic.js",
  "bilibili.template.js",
  "bilibili.video.js",
  "bilibili.history.js",
  "bilibili.ranking.js"
];
class SenderIndex {
  constructor(sender, indexPath) {
    this.sender = sender;
    this.indexPath = indexPath;
    this.row = indexPath.row;
  }
}
class MainView {
  constructor(mod) {
    this.ModuleLoader = mod.ModuleLoader;
  }
  openConfig() {}
  init() {
    try {
      const title = "哔哩哔哩(已登录)",
        menuData = [
          {
            title: "登录配置",
            func: () => {}
          },
          {
            title: "排行榜",
            func: senderIndex =>
              this.ModuleLoader.getModule("bilibili.ranking").getRankingList(
                senderIndex
              )
          },
          {
            title: "入站必刷",
            func: senderIndex =>
              this.ModuleLoader.getModule("bilibili.ranking").getPreciousList(
                senderIndex
              )
          }
        ],
        textListOld = ["设置", "排行榜", "入站必刷"],
        didSelectOld = (indexPath, sender) => {
          const index = indexPath.row;
          switch (index) {
            case 0:
              $prefs.open();
              break;
            case 1:
              this.ModuleLoader.getModule("bilibili.ranking").getRankingList(
                sender,
                indexPath
              );

              break;
            case 2:
              this.ModuleLoader.getModule("bilibili.ranking").getPreciousList(
                sender,
                indexPath
              );
              break;
            default:
              $ui.error("?");
          }
        };
      const navList = [
          {
            title: "主页",
            icon: "house.fill",
            selected: true,
            func: () => {}
          },
          {
            title: "动态",
            icon: "rectangle.grid.3x2",
            func: () => {
              this.ModuleLoader.getModule("bilibili.dynamic").init();
            }
          },
          {
            title: "我的",
            icon: "person.fill",
            func: () => {
              //require("./aboutme.view").init();
              //              $ui.error("没做");
              this.ModuleLoader.getModule("bilibili.user").init();
            }
          }
        ],
        navData = navList.map(item => {
          return {
            menu_image: {
              symbol: item.icon,
              tintColor: item.selected
                ? COLOR.navSelectedIconColor
                : COLOR.navIconColor
            },
            menu_label: {
              text: item.title,
              textColor: item.selected
                ? COLOR.navSelectedTextColor
                : COLOR.navTextColor
            }
          };
        });
      const ViewData = [
        {
          type: "list",
          props: {
            data: menuData.map(m => m.title)
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              try {
                $console.info(sender);
                menuData[indexPath.row].func(
                  new SenderIndex(sender, indexPath)
                );
              } catch (error) {
                $console.error(error);
                $ui.error(error.message);
              }
            }
          }
        },
        {
          type: "matrix",
          props: {
            id: "tab",
            columns: 3,
            itemHeight: 50,
            spacing: 0,
            scrollEnabled: false,
            //bgcolor: $color("clear"),
            template: [
              {
                type: "view",
                props: {
                  id: "view_item"
                },
                layout: (make, view) => {
                  make.size.equalTo(view.super);
                  make.center.equalTo(view.super);
                },
                views: [
                  {
                    type: "image",
                    props: {
                      id: "menu_image",
                      resizable: true,
                      clipsToBounds: false
                    },
                    layout: (make, view) => {
                      make.centerX.equalTo(view.super);
                      make.size.equalTo($size(25, 25));
                      make.top.inset(6);
                    }
                  },
                  {
                    type: "label",
                    props: {
                      id: "menu_label",
                      font: $font(10)
                    },
                    layout: (make, view) => {
                      var preView = view.prev;
                      make.centerX.equalTo(preView);
                      make.bottom.inset(5);
                    }
                  }
                ]
              }
            ],
            data: navData
          },
          layout: (make, view) => {
            make.bottom.inset(0);
            if ($device.info.screen.width > 500) {
              make.width.equalTo(500);
            } else {
              make.left.right.equalTo(0);
            }
            make.centerX.equalTo(view.super);
            make.height.equalTo(50);
          },
          events: {
            didSelect(sender, indexPath, data) {
              const navItem = navList[indexPath.row];
              if (
                navItem.func !== undefined &&
                typeof navItem.func === "function"
              ) {
                try {
                  navItem.func();
                } catch (error) {
                  $console.error(error);
                  //TODO:showErrorAlertAndExit(error.message);
                }
              } else {
                $console.info(indexPath.row);
              }
            }
          }
        }
      ];
      $.showView({
        props: {
          title
        },
        views: [
          {
            type: "view",
            layout: $layout.fillSafeArea,
            views: ViewData
          }
        ]
      });
    } catch (error) {
      $console.error(error);
      //TODO:showErrorAlertAndExit(error.message);
      $ui.error(error.message);
    }
  }
}
class Bilibili extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "bilibili",
      modName: "哔哩哔哩",
      version: "1",
      author: "zhihaofans",
      coreVersion: 18,
      useSqlite: true,
      allowWidget: true,
      allowApi: true,
      iconName: "bold"
    });
    this.ApiManager = app.ModLoader.ApiManager;
    this.ModuleLoader = new ModuleLoader(this);
    this.ModuleLoader.addModulesByList(moduleList);
  }
  run() {
    try {
      const login = this.ModuleLoader.getModule("bilibili.login");
      login.checkLogin().then(
        su => {
          // 已登录
          new MainView(this).init();
        },
        fail => {
          $ui.error("登录失败或取消登录");
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
      default:
    }
  }
}
module.exports = Bilibili;
