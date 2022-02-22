const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Douyin {
  constructor() {}
  init(core) {
    this.Core = core;
    this.$ = this.Core.$;
    $input.text({
      type: $kbType.url,
      placeholder: "输入抖音链接",
      text: "",
      handler: input => {
        const urlList = $detector.link(input);
        if (urlList.length > 0) {
          const url = urlList[0];
          this.download(url);
        } else {
          $ui.error("请输入抖音链接");
        }
      }
    });
  }
  async download(douyinUrl) {
    $ui.loading(true);
    const url = `https://api.oick.cn/douyin/api.php?url=${douyinUrl}`,
      resp = await this.$.http.get({ url }),
      response = resp.response;
    $console.info({ resp });
    $ui.loading(false);
    if (resp.error) {
      $ui.alert({
        title: `请求错误(${response.code})`,
        message: resp.error.localizedDescription,
        actions: [
          {
            title: "OK",
            disabled: false,
            handler: () => {}
          }
        ]
      });
    } else {
      const result = resp.data;
      if (result.code == undefined) {
        const didSelect = (sender, indexPath, data) => {
          $console.info({
            indexPath,
            data
          });
        };
        listKit.pushString(
          "抖音解析结果",
          [`@${result.nickname}`, result.title, result.play, result.music],
          didSelect
        );
      } else {
        $ui.alert({
          title: `请求失败(${result.code})`,
          message: result.message,
          actions: [
            {
              title: "OK",
              disabled: false,
              handler: () => {}
            }
          ]
        });
      }
    }
  }
}

class Main {
  constructor(core) {
    this.Core = core;
    this.Kernel = core.kernel;
    this.$ = core.$;
    this.apiList = [
      {
        id: "douyin.download",
        title: "抖音解析下载",
        class: Douyin,
        func: "init",
        needCore: true
      }
    ];
  }
  init() {
    const didSelect = (sender, indexPath, data) => {
      const thisApi = this.apiList[indexPath.row];
      try {
        const thisClass = new thisApi["class"](this);
        thisClass[thisApi.func](this.Core);
      } catch (error) {
        $console.error(error);
        $ui.alert({
          title: error.name,
          message: error.message,
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
    listKit.pushString(
      this.Core.MOD_NAME,
      this.apiList.map(api => api.title),
      didSelect
    );
  }
}

class FreeApi extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      modId: "free_api",
      modName: "免费Api",
      version: "1",
      author: "zhihaofans",
      needCoreVersion: 3,
      keychainId: "free_api"
    });
  }
  run() {
    $ui.success("run");
    const main = new Main(this);
    main.init();
  }
}
module.exports = FreeApi;
