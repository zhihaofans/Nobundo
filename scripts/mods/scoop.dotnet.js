const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  Http = new Next.Http(5),
  ListViewKit = new Next.ListView();
class DataGetter {
  constructor(mod) {
    this.Mod = mod;
  }
  genJsonData(channelVersion, windowsdesktopData) {
    const { version, x64hash, x86hash } = this.getHashData(windowsdesktopData);
    const result = {
      version,
      "description":
        "The .NET Desktop Runtime enables you to run existing Windows desktop applications.",
      "homepage": `https://dotnet.microsoft.com/download/dotnet/${channelVersion}`,
      "license": {
        "identifier": "MIT",
        "url": "https://github.com/dotnet/core/blob/master/LICENSE.TXT"
      },
      "notes":
        "You can remove .NET Desktop Runtime installer with 'scoop uninstall DotNetDesktopRuntime-installer' after installation",
      "architecture": {
        "64bit": {
          "url": `https://dotnetcli.blob.core.windows.net/dotnet/WindowsDesktop/${version}/windowsdesktop-runtime-${version}-win-x64.exe#/windowsdesktop-runtime-win-x64.exe`,
          "hash": `sha512:${x64hash}`,
          "shortcuts": [
            [
              "windowsdesktop-runtime-win-x64.exe",
              channelVersion === "6.0"
                ? "Install .NET 6 Desktop Runtime (x64)"
                : "Install .NET Desktop Runtime (x64)"
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
              channelVersion === "6.0"
                ? "Install .NET 6 Desktop Runtime (x64)"
                : "Install .NET 6 Desktop Runtime (x86)"
            ]
          ],
          "post_install": ['&"$dir\\windowsdesktop-runtime-win-x86.exe"']
        }
      }
    };
    return this.Mod.Util.toFormatJson(result);
  }
  getHashData(windowsdesktopData) {
    const result = {
      version: windowsdesktopData.version,
      x64hash: undefined,
      x64url: undefined,
      x86hash: undefined,
      x86url: undefined
    };
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
        default:
      }
    });
    return result;
  }
  getLastestVersionData(channelVersion = "7.0") {
    return new Promise(async (resolve, reject) => {
      const url = `https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/${channelVersion}/releases.json`,
        resp = await Http.get({
          url
        }),
        { data, error } = resp;
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

class ScoopDotNetModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "scoop.dotnet",
      name: "Scoop .Net运行时规则生成器",
      version: "1"
      //author: "zhihaofans"
    });
    //this.Mod = mod;
    $console.info(this.Mod);
  }
  initUi() {
    //$ui.success("run");
    new Main(this.Mod).initUi();
  }
}
module.exports = ScoopDotNetModule;
