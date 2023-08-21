const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  Http = new Next.Http(5),
  ListViewKit = new Next.ListView();
class DataGetter {
  constructor() {
    this.URL = {
      GET_LASTEST_VERSION: "https://gitforwindows.org/latest-version.txt",
      SCOOP_JSON_FILE:
        "https://github.com/ScoopInstaller/Main/raw/master/bucket/git.json",
      SCOOP_JSON_FILE_CDN:
        "https://cdn.jsdelivr.net/gh/ScoopInstaller/Main@master/bucket/git.json"
    };
  }
  getScoopData() {
    $console.info("getScoopData");
    return new Promise(async (resolve, reject) => {
      $console.info("httpS");
      const url = this.URL.SCOOP_JSON_FILE_CDN,
        resp = await Http.get({
          url
        });
      $console.info({
        url,
        resp
      });
      $console.info("httpE");
      if (resp.error) {
        reject(resp.error);
      } else {
        resolve(resp.data);
      }
    });
  }
  scoopToTaobao(scoopData) {
    if (scoopData === undefined) {
      return undefined;
    }
    const scoopHostUrl =
        "https://github.com/git-for-windows/git/releases/download/",
      taobaoHostUrl =
        "https://registry.npmmirror.com/-/binary/git-for-windows/",
      taobaoData =
        typeof scoopData === "string" ? JSON.parse(scoopData) : scoopData,
      x64Url = scoopData?.architecture["64bit"]?.url,
      x86Url = scoopData?.architecture["32bit"]?.url,
      x64UpdateUrl = scoopData?.autoupdate?.architecture["64bit"]?.url,
      x86UpdateUrl = scoopData?.autoupdate?.architecture["32bit"]?.url;
    taobaoData["homepage"] =
      "https://registry.npmmirror.com/binary.html?path=git-for-windows/";
    taobaoData["architecture"]["64bit"]["url"] = x64Url.replace(
      scoopHostUrl,
      taobaoHostUrl
    );
    taobaoData["architecture"]["32bit"]["url"] = x86Url.replace(
      scoopHostUrl,
      taobaoHostUrl
    );
    taobaoData["autoupdate"]["architecture"]["64bit"][
      "url"
    ] = x64UpdateUrl.replace(scoopHostUrl, taobaoHostUrl);
    taobaoData["autoupdate"]["architecture"]["32bit"][
      "url"
    ] = x86UpdateUrl.replace(scoopHostUrl, taobaoHostUrl);
    return taobaoData;
  }
}
class Main {
  constructor(mod) {
    this.Mod = mod;
    this.DataGetter = new DataGetter();
  }
  saveTaobaoData(scoopData) {
    const taobaoData = this.DataGetter.scoopToTaobao(scoopData);
    this.Mod.Util.shareJsonData("Git-TaobaoMirror.json", taobaoData);
  }
  init() {
    $ui.loading(true);
    this.DataGetter.getScoopData()
      .then(result => {
        $console.info(result);
        if (result) {
          const mainViewList = [`taobao(${result.version})`, "复制更新日志"],
            didSelect = index => {
              switch (index) {
                case 0:
                  this.saveTaobaoData(result);
                  break;
                case 1:
                  this.Mod.Util.copy(
                    `Git-TaobaoMirror: Update to v${result.version}`
                  );
                  break;
                default:
                  $ui.alert({
                    title: index,
                    message: mainViewList[index],
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
          ListViewKit.pushSimpleText("Git", mainViewList, didSelect);
        } else {
          $ui.alert({
            title: "Hello",
            message: "空白结果",
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
        $console.error(fail);
        $ui.alert({
          title: "Hello",
          message: fail.message,
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
      })
      .finally(() => {
        $ui.loading(false);
      });
  }
}

class ScoopGit extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "scoop.git",
      name: "Scoop Git规则生成器",
      version: "1"
      //author: "zhihaofans"
    });
    //this.Mod = mod;
    //$console.info(this.Mod);
    this.DataGetter = new DataGetter();
  }
  initUi() {
    //$ui.success("run");
    new Main(this.Mod).init();
  }
  getData(version) {
    return new Promise((resolve, reject) => {
      this.DataGetter.getScoopData().then(result => {
        $console.info(result);
        if (result) {
          resolve(this.DataGetter.scoopToTaobao(result));
        } else {
          reject({
            message: "空白结果"
          });
        }
      });
    });
  }
  getFileName() {
    return "Git-TaobaoMirror.json";
  }
  getUpdateNote(version) {
    return new Promise((resolve, reject) => {
      this.DataGetter.getScoopData()
        .then(result => {
          resolve(`Git-TaobaoMirror: Update to v${result.version}`);
        })
        .catch(reject);
    });
  }
  getVersionList() {
    if (this.hasMultipleVersion() === true) {
      return ["1"];
    } else {
      return undefined;
    }
  }
  hasMultipleVersion() {
    return false;
  }
}
module.exports = ScoopGit;
