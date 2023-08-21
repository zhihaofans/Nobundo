const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  Http = new Next.Http(5),
  $ = require("$"),
  ListViewKit = new Next.ListView();
class DataGetter {
  constructor() {
    this.URL = {
      SCOOP_JSON_FILE:
        "https://github.com/ScoopInstaller/Extras/raw/master/bucket/everything.json",
      SCOOP_JSON_FILE_CDN:
        "https://cdn.jsdelivr.net/gh/ScoopInstaller/Extras@master/bucket/everything.json"
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
  getVersionInfo(version) {
    return new Promise(async (resolve, reject) => {
      $console.info("getVersionInfo", "start");
      const url = `https://www.voidtools.com/Everything-${version}.sha256`,
        resp = await Http.get({
          url
        });
      $console.info({
        url,
        resp
      });
      $console.info("getVersionInfo", "end");
      if (resp.error) {
        $console.error(resp.error);
        reject(resp.error);
      } else {
        const fileHash = { x64: "", x86: "" },
          hashList = resp.data.split("\n");
        $console.info({
          hashList
        });
        try {
          hashList.map(item => {
            const itemList = item.split(" *"),
              hash = itemList[0],
              fileName = itemList[1];
            $console.info(itemList, typeof fileHash);
            if (
              $.hasString(fileName) &&
              fileName.indexOf(`Everything-${version}.x86-Setup.exe`) >= 0
            ) {
              fileHash.x86 = hash;
            } else if (
              fileName.indexOf(`Everything-${version}.x64-Setup.exe`) >= 0
            ) {
              fileHash.x64 = hash;
            }
          });
          $console.info({
            fileHash
          });
          resolve(fileHash);
        } catch (error) {
          $console.error(error);
          reject(error);
        } finally {
          $console.info("getVersionInfo", "finally", version);
        }
      }
    });
  }
  scoopToJson({ version, x64hash, x86hash }) {
    return {
      version,
      "description": "Locate files and folders by name instantly.",
      "homepage": "https://www.voidtools.com",
      "license": "MIT",
      "architecture": {
        "64bit": {
          "url": `https://www.voidtools.com/Everything-${version}.x64-Setup.exe#/Everything-Setup.exe`,
          "hash": x64hash
        },
        "32bit": {
          "url": `https://www.voidtools.com/Everything-${version}.x86-Setup.exe#/Everything-Setup.exe`,
          "hash": x86hash
        }
      },
      "shortcuts": [["Everything-Setup.exe", "Install Everything"]],
      "checkver": "Download Everything ([\\d.]+)",
      "autoupdate": {
        "architecture": {
          "64bit": {
            "url":
              "https://www.voidtools.com/Everything-$version.x64-Setup.exe#/Everything-Setup.exe"
          },
          "32bit": {
            "url":
              "https://www.voidtools.com/Everything-$version.x86-Setup.exe#/Everything-Setup.exe"
          }
        },
        "hash": {
          "url": "$baseurl/Everything-$version.sha256"
        }
      }
    };
  }
}
class Main {
  constructor(mod) {
    this.Mod = mod;
    this.DataGetter = new DataGetter();
  }
  saveData(scoopData) {
    const version = scoopData.version;
    this.DataGetter.getVersionInfo(version)
      .then(result => {
        if (result) {
          const x64hash = result[`Everything-${version}.x64-Setup.exe`],
            x86hash = result[`Everything-${version}.x86-Setup.exe`],
            jsonData = this.DataGetter.scoopToJson({
              version,
              x64hash,
              x86hash
            });
          $console.info({
            jsonData
          });
          //this.Mod.Util.shareJsonData("everything-installer.json", jsonData);
        } else {
          $ui.error("result error:line 140");
        }
      })
      .catch(fail => {
        $console.error(fail);
      });
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
                  this.Mod.Util.copy(`Update to v${result.version}`);
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
          ListViewKit.pushSimpleText("everything", mainViewList, didSelect);
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
class ScoopModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "scoop.everything",
      name: "Scoop Everything规则生成器",
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
      this.DataGetter.getScoopData()
        .then(scoopData => {
          const version = scoopData.version;
          this.DataGetter.getVersionInfo(version)
            .then(result => {
              if (result) {
                const x64hash = result[`Everything-${version}.x64-Setup.exe`],
                  x86hash = result[`Everything-${version}.x86-Setup.exe`],
                  jsonData = this.DataGetter.scoopToJson({
                    version,
                    x64hash,
                    x86hash
                  });
                $console.info({
                  jsonData
                });
                resolve(jsonData);
              } else {
                $ui.error("result error:line 255");
                reject(undefined);
              }
            })
            .catch(fail => {
              $console.error(fail);
              reject(fail);
            });
        })
        .catch(fail => {
          $console.error(fail);
          reject(undefined);
        });
    });
  }
  getFileName(version) {
    return "Everything-installer.json";
  }
  getUpdateNote() {
    return new Promise((resolve, reject) => {
      this.DataGetter.getScoopData()
        .then(result => {
          resolve(`Everything-installer: Update to v${result.version}`);
        })
        .catch(fail => {
          $console.error(fail);
          reject(undefined);
        });
    });
  }
  getVersionList() {
    return undefined;
  }
  hasMultipleVersion() {
    return false;
  }
}
module.exports = ScoopModule;
