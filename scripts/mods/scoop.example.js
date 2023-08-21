const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  ListViewKit = new Next.ListView();

class ExampleModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "scoop.example",
      name: "scoop站点例子",
      version: "1"
      //author: "zhihaofans"
    });
  }
  initUi() {
    //$ui.success("run");
  }
  getData(version) {
    return new Promise((resolve, reject) => {
      resolve({
        version,
        "description": "Locate files and folders by name instantly.",
        "homepage": "https://www.voidtools.com",
        "license": "MIT",
        "architecture": {
          "64bit": {
            "url": `https://www.voidtools.com/Everything-${version}.x64-Setup.exe#/Everything-Setup.exe`,
            "hash": "x64hash"
          },
          "32bit": {
            "url": `https://www.voidtools.com/Everything-${version}.x86-Setup.exe#/Everything-Setup.exe`,
            "hash": "x86hash"
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
      });
    });
  }
  getFileName(version) {
    return "Everything-installer.json";
  }
  getUpdateNote(version) {
    return new Promise((resolve, reject) => {
      resolve("scoop: Update to v1");
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
module.exports = ExampleModule;
