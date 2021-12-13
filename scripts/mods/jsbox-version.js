class v2_19_0 {
  constructor(name) {
    this.NAME = name;
  }
  init() {
    $ui.push({
      props: {
        title: "v2.19.0"
      },
      views: [
        {
          type: "list",
          props: {
            data: ["钥匙串"]
          },
          layout: $layout.fill,
          events: {
            didSelect: (_sender, indexPath, _data) => {
              switch (indexPath.row) {
                case 0:
                  this.keychain();
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
            data: ["写入", "读取"]
          },
          layout: $layout.fill,
          events: {
            didSelect: (_sender, indexPath, _data) => {
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
                default:
                  $ui.error("待更新");
              }
            }
          }
        }
      ]
    });
  }
}
const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit(),
  versionList = [
    {
      version: "2.19.0",
      classObject: v2_19_0,
      index: "init"
    }
  ];

class Main {
  constructor(core) {
    this.core = core;
    this.kernel = core.kernel;
    this.http = new core.$_.Http();
  }
  init() {
    const main_view_list = versionList.map(v =>
        v.version == $app.info.version ? `${v.version}(当前版本)` : v.version
      ),
      didSelect = (sender, indexPath, data) => {
        const thisVer = versionList[indexPath.row],
          versionClass = new thisVer.classObject();
        versionClass[thisVer.index]();
      };
    listKit.pushString(this.core.MOD_NAME, main_view_list, didSelect);
  }
}

class Version extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      mod_name: "JSBox新功能测试",
      version: "1",
      author: "zhihaofans",
      need_database: false,
      need_core_version: 1,
      database_id: "jsbox.version"
    });
    this.kernel = kernel;
  }
  run() {
    const main = new Main(this);
    main.init();
  }
}
module.exports = Version;
