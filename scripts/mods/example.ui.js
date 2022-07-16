const { CoreModule } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(mod) {
    this.Mod = mod;
    this.$ = this.Mod.$;
  }
  test() {
    $ui.push({
      props: {
        title: ""
      },
      views: [
        {
          type: "list",
          props: {
            template: {
              props: {
                bgcolor: $color("clear"),
                autoRowHeight: true,
                estimatedRowHeight: 100
              },
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
                          type: "label",
                          props: {
                            id: "labelTitle",

                            align: $align.left,
                            font: $font(24)
                          },
                          layout: make => {
                            make.height.equalTo(24);
                            make.left.top.right.inset(5);
                          }
                        },
                        {
                          type: "label",
                          props: {
                            id: "labelData",

                            align: $align.left,
                            font: $font(12),
                            textColor: $color("gray")
                          },
                          layout: make => {
                            make.height.equalTo(40);
                            make.top.left.right.bottom.inset(2);
                            //                            make.top.equalTo($("labelTitle").bottom);
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
                labelTitle: {
                  text: "标题1"
                },
                labelData: {
                  text: "2022/07/22 内容1"
                }
              },
              {
                labelTitle: {
                  text: "标题2"
                },
                labelData: {
                  text: "内容2"
                }
              }
            ]
          },
          layout: $layout.fill,
          events: {
            didSelect: (_sender, indexPath, data) => {
              const section = indexPath.section,
                row = indexPath.row;
              $console.info(row);
            }
          }
        }
      ]
    });
  }
  init() {
    const mainViewList = ["example 1"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.test();
            break;
          default:
            $ui.alert({
              title: indexPath.row,
              message: data,
              actions: [
                {
                  title: "OK",
                  disabled: false, // Optional
                  handler: () => {
                    this.test();
                  }
                }
              ]
            });
        }
      };
    listKit.pushString(this.Mod.MOD_INFO.NAME, mainViewList, didSelect);
  }
}

class ExampleModule extends CoreModule {
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
