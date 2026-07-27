const { ModCore } = require("CoreJS");
const HttpLib = require("HttpLib"),
  $ = require("$");
class PastersCore {
  constructor(mod) {}
  getClip(link) {
    return new Promise((resolve, reject) => {
      if (link.startsWith("https://paste.rs/")) {
        new HttpLib(link)
          .get()
          .then(resp => {
            if (resp.isError != false) {
              reject(resp.errorMessage || "未知错误");
            } else {
              try {
                const result = resp.data;
                $console.info(result);
                if ($.isEmpty(result) || result.startsWith("<!DOCTYPE html>")) {
                  reject("空白剪切板或错误连接");
                } else {
                  resolve(result);
                }
              } catch (error) {
                $console.error(error);
                reject(error.message);
              }
            }
          })
          .catch(fail => reject(fail));
      } else {
        reject("不是有效链接");
      }
    });
  }
}
class WebclipView {
  constructor(mod) {
    this.Core = new PastersCore(mod);
  }
  initView() {
    const clipWeb = [
      {
        type: "picker",
        props: {
          items: [
            {
              title: "服务商：",
              items: [
                {
                  title: "paste.rs"
                }
              ]
            }
          ]
        },
        layout: make => {
          make.left.top.right.equalTo(0);
          make.height.equalTo(50);
        }
      }
    ];
    $ui.push({
      props: {
        title: "网络剪切板"
      },
      views: [
        {
          type: "view",
          props: {
            //bgcolor: $color("#FF0000")
          },
          layout: $layout.fillSafeArea, //(make, view) => {},
          views: clipWeb,
          events: {}
        }
      ]
    });
  }
  init() {
    $ui.menu({
      items: ["发送剪切板", "获取剪切板"],
      handler: (title, idx) => {
        switch (idx) {
          case 0:
            try {
              this.initView();
            } catch (error) {
              $console.error(error);
              $ui.alert({
                title: "Hello",
                message: error.message,
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
            } finally {
            }
            break;
          case 1:
            $input.text({
              type: $kbType.text,
              placeholder: "输入网络剪切板地址(https://paste.rs/xxx)",
              text: "",
              handler: link => {
                this.Core.getClip(link)
                  .then(result => {
                    $input.text({
                      type: $kbType.text,
                      placeholder: "这里是剪切板内容",
                      text: result,
                      handler: text => {}
                    });
                  })
                  .catch(err => {
                    $ui.error(err);
                  });
              }
            });
            break;
          default:
        }
      }
    });
  }
}

class Example extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "webclip",
      modName: "网络剪切板",
      version: "1",
      author: "zhihaofans",
      coreVersion: 18,
      useSqlite: false,
      allowWidget: false,
      allowApi: false,
      iconName: "doc.on.clipboard.fill"
    });
  }
  run() {
    try {
      new WebclipView(this).init();
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
