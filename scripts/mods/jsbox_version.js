const { ModCore } = require("CoreJS"),
  $ = require("$"),
  Next = require("Next"),
  ListView = new Next.ListView();
class ApiTest {
  constructor(mod) {
    this.Http = mod.Http;
  }
  init() {
    this.pickImage();
  }
  async httpHead() {
    const result = await this.Http.head({
      url: "https://www.httpbin.org/get"
    });
    $console.warn(result.response);
  }
  pickImage() {
    $photo.pick({
      format: "data",
      handler: resp => {
        const image = resp.image;
        $console.info(resp);
      }
    });
  }
}

class UiTest {
  constructor() {}
  init() {
    $ui.push({
      props: {
        title: ""
      },
      views: [
        {
          type: "list",
          props: {
            data: [
              {
                title: "Default",
                rows: [
                  {
                    type: "progress",
                    props: {
                      id: "progress1",
                      value: 0.5
                    },
                    layout: (make, view) => {
                      make.centerY.equalTo(view.super);
                      make.left.right.inset(20);
                    }
                  }
                ]
              }
            ]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const section = indexPath.section;
              const row = indexPath.row;
            }
          }
        }
      ]
    });
    $console.warn($("progress1").value);
    $("progress1").value = 0.9;
    $console.warn($("progress1").value);
  }
}

class v2_19_0 {
  constructor() {}
  init() {
    $ui.push({
      props: {
        title: "v2.19.0"
      },
      views: [
        {
          type: "list",
          props: {
            data: ["钥匙串", "UUID", "Objective-C"]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              switch (indexPath.row) {
                case 0:
                  this.keychain();
                  break;
                case 1:
                  this.uuid();
                  break;
                case 2:
                  this.obc();
                  break;
              }
            }
          }
        }
      ]
    });
  }
  keychain() {
    const keychainDomain = "jsbox-version.v2_19_0.keychain";
    $ui.push({
      props: {
        title: "钥匙串"
      },
      views: [
        {
          type: "list",
          props: {
            data: ["写入", "读取", "查看所有", "清空所有"]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              switch (indexPath.row) {
                case 0:
                  $input.text({
                    type: $kbType.text,
                    placeholder: "key",
                    text: "",
                    handler: key => {
                      if (key.length > 0) {
                        $input.text({
                          type: $kbType.text,
                          placeholder: "",
                          text: "",
                          handler: value => {
                            if (value.length > 0) {
                              const setResult = $keychain.set(
                                key,
                                value,
                                keychainDomain
                              );
                              setResult
                                ? $ui.success(setResult)
                                : $ui.error(setResult);
                            } else {
                              $ui.toast("请输入value");
                            }
                          }
                        });
                      } else {
                        $ui.toast("请输入key");
                      }
                    }
                  });
                  break;
                case 1:
                  $input.text({
                    type: $kbType.text,
                    placeholder: "key",
                    text: "",
                    handler: key => {
                      if (key.length > 0) {
                        const keychainResult = $keychain.get(
                          key,
                          keychainDomain
                        );
                        if (keychainResult && keychainResult.length > 0) {
                          $input.text({
                            type: $kbType.text,
                            placeholder: "",
                            text: keychainResult,
                            handler: result => {}
                          });
                        } else {
                          $ui.toast("不存在");
                        }
                      } else {
                        $ui.toast("请输入key");
                      }
                    }
                  });
                  break;
                case 2:
                  var keys = $keychain.keys(keychainDomain);
                  if (keys && keys.length > 0) {
                    $ui.push({
                      props: {
                        title: ""
                      },
                      views: [
                        {
                          type: "list",
                          props: {
                            data: keys
                          },
                          layout: $layout.fill,
                          events: {
                            didSelect: (sender, indexPath, data) => {
                              const thisKey = keys[indexPath.row];
                              $input.text({
                                type: $kbType.text,
                                placeholder: thisKey,
                                text: $keychain.get(thisKey, keychainDomain),
                                handler: text => {}
                              });
                            }
                          }
                        }
                      ]
                    });
                  } else {
                    $ui.toast("空白");
                  }
                  break;
                case 3:
                  $keychain.clear(keychainDomain);
                  break;
                default:
                  $ui.error("待更新");
              }
            }
          }
        }
      ]
    });
  }
  uuid() {
    $input.text({
      type: $kbType.text,
      placeholder: "",
      text: $text.uuid,
      handler: text => {}
    });
  }
  obc() {
    $define({
      type: "MyHelper",
      classEvents: {
        open: scheme => {
          const url = $objc("NSURL").invoke("URLWithString", scheme);
          $objc("UIApplication").invoke("sharedApplication.openURL", url);
        }
      }
    });
    $ui.render({
      views: [
        {
          type: "button",
          props: {
            bgcolor: $objc("UIColor").invoke("blackColor").jsValue(),
            titleColor: $color("#FFFFFF").ocValue().jsValue(),
            title: "WeChat"
          },
          layout: (make, view) => {
            make.center.equalTo(view.super);
            make.size.equalTo($size(100, 32));
          },
          events: {
            tapped: sender => {
              $objc("MyHelper").invoke("open", "weixin://");
            }
          }
        }
      ]
    });

    const window = $ui.window.ocValue();
    const label = $objc("UILabel").invoke("alloc.init");
    label.invoke("setTextAlignment", 1);
    label.invoke("setText", "Runtime");
    label.invoke("setFrame", {
      x: $device.info.screen.width * 0.5 - 50,
      y: 240,
      width: 100,
      height: 32
    });
    window.invoke("addSubview", label);
  }
}
const versionList = [
  {
    version: "2.19.0",
    classObject: v2_19_0,
    index: "init"
  },
  {
    version: "ui测试",
    classObject: UiTest,
    index: "init"
  },
  {
    version: "api测试",
    classObject: ApiTest,
    index: "init",
    needCore: true
  }
];

class Main {
  constructor(mod) {
    this.Mod = mod;
  }
  init() {
    const main_view_list = versionList.map(v =>
        v.version == $app.info.version ? `${v.version}(当前版本)` : v.version
      ),
      didSelect = index => {
        const thisVer = versionList[index],
          versionClass = new thisVer.classObject(
            thisVer.needCore == true ? this.Mod : undefined
          );
        versionClass[thisVer.index]();
      };
    ListView.pushSimpleText(this.Mod.MOD_NAME, main_view_list, didSelect);
  }
}

class Version extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "jsbox_version",
      modName: "JSBox新功能测试",
      version: "3a",
      author: "zhihaofans",
      coreVersion: 9
    });
    this.$ = $;
    this.Http = $.http;
    this.Storage = Next.Storage;
  }
  run() {
    const main = new Main(this);
    main.init();
  }
}
module.exports = Version;
