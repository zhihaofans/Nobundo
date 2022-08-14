const { ModModule } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  next = require("../../Core.js/next"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(mod) {
    this.Mod = mod;
    this.$ = this.Mod.$;
    this.listViewKit = new next.ListView();
  }
  multListTest() {
    const listData = [
      {
        title: "标题1",
        subTitle: "2022/07/22 内容1"
      },
      {
        title: "标题2",
        subTitle: "内容2"
      }
    ];
    this.listViewKit.pushTwoLineList({
      title: "example 1",
      items: listData
    });
  }
  gridViewTest() {
    $ui.push({
      props: {
        title: ""
      },
      views: [
        {
          type: "matrix",
          props: {
            columns: 3,
            itemHeight: 100,
            spacing: 5,
            template: {
              props: {},
              views: [
                {
                  type: "stack",
                  props: {
                    axis: $stackViewAxis.vertical,
                    spacing: 5,
                    distribution: $stackViewDistribution.fillProportionally,
                    stack: {
                      views: [
                        {
                          type: "image",
                          props: {
                            id: "icon"
                          },
                          layout: function (make, view) {
                            make.center.equalTo(view.super);
                            make.size.equalTo($size(50, 50));
                          }
                        },
                        {
                          type: "label",
                          props: {
                            id: "label",

                            align: $align.left,
                            font: $font(24)
                          },
                          layout: make => {
                            make.height.equalTo(20);
                            make.left.top.right.inset(0);
                          }
                        }
                      ]
                    }
                  },
                  layout: $layout.fill
                }
              ]
            },
            data: [
              {
                label: {
                  text: "example 1"
                },
                icon: {
                  src:
                    "https://images.apple.com/v/ios/what-is/b/images/performance_large.jpg"
                }
              },
              {
                label: {
                  text: "example 1"
                },
                icon: {
                  src:
                    "https://images.apple.com/v/ios/what-is/b/images/performance_large.jpg"
                }
              },
              {
                icon: {
                  icon: $icon("005", $color("red"), $size(12, 12))
                }
              },
              {
                label: {
                  text: "example 1"
                }
              },
              {
                label: {
                  text: "example 1"
                }
              }
            ]
          },
          layout: $layout.fill
        }
      ]
    });
  }
  init() {
    const mainViewList = ["example 1", "example 2"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.multListTest();
            break;
          case 1:
            this.gridViewTest();
            break;
          default:
            $ui.alert({
              title: indexPath.row,
              message: data,
              actions: [
                {
                  title: "OK",
                  disabled: false, // Optional
                  handler: () => {}
                }
              ]
            });
        }
      };
    listKit.pushString(this.Mod.MOD_INFO.NAME, mainViewList, didSelect);
  }
}

class ExampleModule extends ModModule {
  constructor(mod) {
    super({
      modId: "example",
      moduleId: "example.ui",
      moduleName: "例子ui",
      version: "1a"
      //author: "zhihaofans"
    });
    this.Mod = mod;
  }
  initUi() {
    //    $ui.success("run");
    const main = new Main(this.Mod);
    main.init();
  }
}
module.exports = ExampleModule;
