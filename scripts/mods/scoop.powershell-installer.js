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
        "https://cdn.jsdelivr.net/gh/chawyehsu/dorado@master/bucket/git.json"
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
  scoopToData(scoopData) {
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
  saveData(scoopData) {
    const taobaoData = this.DataGetter.scoopToTaobao(scoopData);
    this.Mod.Util.shareJsonData("Git-TaobaoMirror.json", taobaoData);
  }
  init() {
    $ui.loading(true);
    this.DataGetter.getScoopData()
      .then(result => {
        $console.info(result);
        if (result) {
          const mainViewList = [`导出(${result.version})`, "复制更新日志"],
            didSelect = index => {
              switch (index) {
                case 0:
                  this.saveData(result);
                  break;
                case 1:
                  this.Mod.Util.copy(
                    `PowerShell-installer:Update to v${result.version}`
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
          ListViewKit.pushSimpleText("PowerShell", mainViewList, didSelect);
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

class ScoopPowershell extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "scoop.powershell",
      name: "Scoop PowerShell规则生成器",
      version: "1"
      //author: "zhihaofans"
    });
    //this.Mod = mod;
    //$console.info(this.Mod);
  }
  initUi() {
    //$ui.success("run");
    new Main(this.Mod).init();
  }
}
module.exports = ScoopPowershell;
