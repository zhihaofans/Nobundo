const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  Http = new Next.Http(5),
  ListViewKit = new Next.ListView();
class DataGetter {
  constructor(mod) {
    this.Mod = mod;
  }
  genJsonData(channelVersion, windowsdesktopData) {
    const { version, x64hash, x86hash, arm64hash } = this.getHashData(
      windowsdesktopData
    );
    $console.info({
      windowsdesktopData,
      version,
      x64hash,
      x86hash
    });
    const result = {
      version,
      "description":
        "The .NET Desktop Runtime enables you to run existing Windows desktop applications.",
      "homepage": `https://dotnet.microsoft.com/download/dotnet/${channelVersion}`,
      "license": {
        "identifier": "MIT",
        "url": "https://github.com/dotnet/core/blob/master/LICENSE.TXT"
      },
      "architecture": {
        "64bit": {
          "url": `https://dotnetcli.blob.core.windows.net/dotnet/WindowsDesktop/${version}/windowsdesktop-runtime-${version}-win-x64.exe#/windowsdesktop-runtime-win-x64.exe`,
          "hash": `sha512:${x64hash}`,
          "shortcuts": [
            [
              "windowsdesktop-runtime-win-x64.exe",
              `Install .NET ${channelVersion} Desktop Runtime (x64)`
            ]
          ],
          "post_install": ['&"$dir\\windowsdesktop-runtime-win-x64.exe"']
        },
        "32bit": {
          "url": `https://dotnetcli.blob.core.windows.net/dotnet/WindowsDesktop/${version}/windowsdesktop-runtime-${version}-win-x86.exe#/windowsdesktop-runtime-win-x86.exe`,
          "hash": `sha512:${x86hash}`,
          "shortcuts": [
            [
              "windowsdesktop-runtime-win-x86.exe",
              `Install .NET ${channelVersion} Desktop Runtime (x86)`
            ]
          ],
          "post_install": ['&"$dir\\windowsdesktop-runtime-win-x86.exe"']
        },
        "arm64": {
          "url": `https://dotnetcli.blob.core.windows.net/dotnet/WindowsDesktop/${version}/windowsdesktop-runtime-${version}-win-arm64.exe#/windowsdesktop-runtime-win-arm64.exe`,
          "hash": `sha512:${arm64hash}`,
          "shortcuts": [
            [
              "windowsdesktop-runtime-win-arm64.exe",
              `Install .NET ${channelVersion} Desktop Runtime (arm64)`
            ]
          ],
          "post_install": ['&"$dir\\windowsdesktop-runtime-win-arm64.exe"']
        }
      }
    };
    return result;
    //return this.Mod.Util.toFormatJson(result);
  }
  getHashData(windowsdesktopData) {
    const result = {
      version: windowsdesktopData.version,
      x64hash: undefined,
      x64url: undefined,
      x86hash: undefined,
      x86url: undefined,
      arm64hash: undefined,
      arm64url: undefined
    };
    try {
      windowsdesktopData.files.map(file => {
        const { name, url, hash } = file;
        switch (name) {
          case "windowsdesktop-runtime-win-x64.exe":
            result.x64hash = hash;
            result.x64url = url;
            break;
          case "windowsdesktop-runtime-win-x86.exe":
            result.x86hash = hash;
            result.x86url = url;
            break;
          case "windowsdesktop-runtime-win-arm64.exe":
            result.arm64hash = hash;
            result.arm64url = url;
            break;
          default:
        }
      });
      return result;
    } catch (error) {
      $console.error(error);
      return undefined;
    }
  }
  getLastestVersionData(channelVersion = "7.0") {
    return new Promise(async (resolve, reject) => {
      $console.info("getLastestVersionData.start", channelVersion);
      const url = `https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/${channelVersion}/releases.json`,
        resp = await Http.get({
          url
        }),
        { data, error } = resp;
      $console.info("getLastestVersionData.end", `error:${error != undefined}`);
      $console.info({
        data
      });
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  }
  initView(versionData, channelVersion) {
    $console.info({
      versionData
    });
    $ui.loading(false);
    const versionCode = versionData["latest-release"],
      lastestVersionData = versionData["releases"][0]["windowsdesktop"];
    $console.info({
      lastestVersionData
    });
    $console.info({
      ver: lastestVersionData["version"],
      versionCode
    });
    if (lastestVersionData["version"] === versionCode) {
      const jsonStr = this.genJsonData(
        versionData["channel-version"],
        lastestVersionData
      );
      let fileName = "";
      if (channelVersion === "7.0") {
        fileName = "DotNetDesktopRuntime-installer.json";
      } else if (channelVersion === "6.0") {
        fileName = "DotNetDesktopRuntime6-installer.json";
      } else {
        $ui.error("错误版本!");
        return;
      }
      this.Mod.Util.shareStr(fileName, jsonStr);
    } else {
      $ui.error("版本号不符合");
    }
  }
  init(channelVersion = "7.0") {
    switch (channelVersion) {
      case "8.0":
      case "7.0":
      case "6.0":
        $ui.loading(true);
        this.getLastestVersionData(channelVersion)
          .then(versionData => this.initView(versionData, channelVersion))
          .catch(error => {
            $console.error(error);
            $ui.loading(false);
            $ui.alert({
              title: "发生错误",
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
          });
        break;
      default:
        $ui.error("错误版本");
    }
  }
}
class Main {
  constructor(mod) {
    this.Mod = mod;
    this.$ = mod.$;
    this.dataGatter = new DataGetter(mod);
  }
  init() {
    this.dataGatter.init();
  }
  initUi() {
    const mainViewList = [".Net 7", ".Net 6"],
      didSelect = index => {
        switch (index) {
          case 0:
            this.dataGatter.init("7.0");
            break;
          case 1:
            this.dataGatter.init("6.0");
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
    ListViewKit.pushSimpleText(this.Mod.MOD_INFO.NAME, mainViewList, didSelect);
  }
}

class ScoopModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "scoop.dotnet",
      name: "Scoop .Net运行时规则生成器",
      version: "1"
      //author: "zhihaofans"
    });
    this.DataGetter = new DataGetter();
    this.VERSION_DATA = {
      "6.0": {
        FILE_NAME: "DotNetDesktopRuntime6-installer.json",
        UPDATE_NOTE_NAME: "DotNetDesktopRuntime6-installer"
      },
      "7.0": {
        FILE_NAME: "DotNetDesktopRuntime7-installer.json",
        UPDATE_NOTE_NAME: "DotNetDesktopRuntime7-installer"
      },
      "8.0": {
        FILE_NAME: "DotNetDesktopRuntime8-installer.json",
        UPDATE_NOTE_NAME: "DotNetDesktopRuntime8-installer"
      },
      "9.0": {
        FILE_NAME: "DotNetDesktopRuntime9-installer.json",
        UPDATE_NOTE_NAME: "DotNetDesktopRuntime9-installer"
      }
    };
  }
  initUi() {
    //$ui.success("run");
    new Main(this.Mod).initUi();
  }
  getData(channelVersion) {
    return new Promise((resolve, reject) => {
      try {
        this.DataGetter.getLastestVersionData(channelVersion).then(
          versionData => {
            $console.info({
              channelVersion
            });
            const versionCode = versionData["latest-release"],
              lastestVersionData = versionData["releases"][0]["windowsdesktop"];
            $console.info({
              versionCode,
              lastestVersionData
            });
            try {
              const jsonData = this.DataGetter.genJsonData(
                channelVersion,
                lastestVersionData
              );
              $console.info({
                jsonData
              });
              resolve(jsonData);
            } catch (error) {
              $console.error(error);
              reject(error);
            }
          }
        );
      } catch (error) {
        $console.error(error);
        reject(error);
      } finally {
        $console.info({
          getData_finally: channelVersion
        });
      }
    });
  }
  getFileName(channelVersion) {
    return this.VERSION_DATA[channelVersion]?.FILE_NAME;
  }
  getUpdateNote(channelVersion) {
    return new Promise((resolve, reject) => {
      const appId = this.VERSION_DATA[channelVersion]?.UPDATE_NOTE_NAME;
      $console.info(channelVersion, appId);
      this.DataGetter.getLastestVersionData(channelVersion).then(
        versionData => {
          $console.info(channelVersion);
          resolve(`${appId}: Update to v${versionData["latest-runtime"]}`);
        }
      );
    });
  }
  getVersionList() {
    if (this.hasMultipleVersion() === true) {
      return ["9.0", "8.0", "7.0", "6.0"];
    } else {
      return undefined;
    }
  }
  hasMultipleVersion() {
    return true;
  }
}
module.exports = ScoopModule;
