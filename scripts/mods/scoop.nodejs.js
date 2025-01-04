const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  Http = new Next.Http(5),
  $ = require("$"),
  ListViewKit = new Next.ListView();
class DataGetter {
  constructor(mod) {
    this.Mod = mod;
    this.VersionData = {
      "lts_taobao": {
        file_name: "Nodejs-LTS-TaobaoMirror.json",
        name: "Nodejs-LTS-TaobaoMirror"
      },
      "lts_tuna": {
        file_name: "Nodejs-LTS-tuna.json",
        name: "Nodejs-LTS-tuna"
      },
      "current_taobao": {
        file_name: "Nodejs-TaobaoMirror.json",
        name: "Nodejs-TaobaoMirror"
      },
      "current_tuna": {
        file_name: "Nodejs-tuna.json",
        name: "Nodejs-tuna"
      }
    };
  }
  async getHashFile(version) {
    const url = `https://nodejs.org/dist/v${version}/SHASUMS256.txt`,
      resp = await Http.get({
        url
      }),
      result = resp.data;
    $console.info({
      version,
      resp
    });
    if (result === undefined) {
      return undefined;
    }
    const hashData = {};
    result.split("\n").map(line => {
      const lineList = line.split("  "),
        fileName = lineList[1],
        hash = lineList[0];
      if (lineList.length === 2) {
        hashData[fileName] = hash;
      }
    });
    $console.info({
      hashData
    });
    return hashData;
  }
  async getHashData(version) {
    const result = {
        version,
        x64hash: undefined,
        x86hash: undefined
      },
      hashFile = await this.getHashFile(version);
    result.x64hash = "sha256:" + hashFile[`node-v${version}-win-x64.7z`];
    result.x86hash = "sha256:" + hashFile[`node-v${version}-win-x86.7z`];
    return result;
  }
  async getVersionList() {
    const url = "https://nodejs.org/dist/index.json",
      resp = await Http.get({
        url
      });
    $console.info({
      resp
    });
    return resp.data;
  }
  getLastestVersion(versionListData, lts = false) {
    const newList = versionListData.filter(item => {
      if (lts === true) {
        return item.lts !== false;
      } else {
        return true;
      }
    });
    $console.info({
      newList
    });
    return newList.length > 0 ? newList[0].version.substring(1) : undefined;
  }
  taobao({ version, x64hash, x86hash }) {
    return {
      version,
      "description":
        "As an asynchronous event driven JavaScript runtime, Node is designed to build scalable network applications.",
      "homepage": "https://registry.npmmirror.com/binary.html?path=node/",
      "license": "MIT",
      "architecture": {
        "64bit": {
          "url": `https://registry.npmmirror.com/-/binary/node/v${version}/node-v${version}-win-x64.7z`,
          "hash": x64hash,
          "extract_dir": `node-v${version}-win-x64`
        },
        "32bit": {
          "url": `https://registry.npmmirror.com/-/binary/node/v${version}/node-v${version}-win-x86.7z`,
          "hash": x86hash,
          "extract_dir": `node-v${version}-win-x86`
        }
      },
      "persist": ["bin", "cache"],
      "env_add_path": ["bin", "."],
      "post_install": [
        "# Set npm prefix to install modules inside bin and npm cache so they persist",
        'Set-Content -Value "prefix=$persist_dir\\bin`ncache=$persist_dir\\cache" -Path "$dir\\node_modules\\npm\\npmrc"'
      ]
    };
  }
  tuna({ version, x64hash, x86hash }) {
    return {
      version,
      "description":
        "As an asynchronous event driven JavaScript runtime, Node is designed to build scalable network applications.",
      "homepage": "https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/",
      "license": "MIT",
      "architecture": {
        "64bit": {
          "url": `https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/v${version}/node-v${version}-win-x64.7z`,
          "hash": x64hash,
          "extract_dir": `node-v${version}-win-x64`
        },
        "32bit": {
          "url": `https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/v${version}/node-v${version}-win-x64.7z`,
          "hash": x86hash,
          "extract_dir": `node-v${version}-win-x86`
        }
      },
      "persist": ["bin", "cache"],
      "env_add_path": ["bin", "."],
      "post_install": [
        "# Set npm prefix to install modules inside bin and npm cache so they persist",
        'Set-Content -Value "prefix=$persist_dir\\bin`ncache=$persist_dir\\cache" -Path "$dir\\node_modules\\npm\\npmrc"'
      ]
    };
  }
}
class NodejsView {
  constructor(_module) {
    this.Module = _module;
    this.Mod = _module.Mod;
    this.DataGetter = new DataGetter();
    this.VersionFile = undefined;
    this.LastestVersionData = {
      lts: {
        version: "18.15.0",
        x64hash: "sha256:",
        x86hash: "sha256:"
      },
      current: {
        version: "19.8.1",
        x64hash: "sha256:",
        x86hash: "sha256:"
      }
    };
    this.VersionData = this.DataGetter.VersionData;
  }
  shareData(site, version, versionCode, x64hash, x86hash) {
    $console.info({
      site,
      version,
      versionCode,
      x64hash,
      x86hash,
      all_data: this.VersionData
    });
    const verCode = `${version}_${site}`,
      verData = this.VersionData[verCode],
      fileName = verData?.file_name;
    $console.info({
      fileName,
      verData,
      verCode
    });
    if (verData && fileName) {
      let jsonData = {};
      switch (site.toLowerCase()) {
        case "tuna":
          jsonData = this.DataGetter.tuna({
            version: versionCode,
            x64hash,
            x86hash
          });
          break;
        case "taobao":
          jsonData = this.DataGetter.taobao({
            version: versionCode,
            x64hash,
            x86hash
          });
          break;
        default:
          $ui.error("未知站点");
          return undefined;
      }
      this.Mod.Util.shareJsonData(fileName, jsonData);
    } else {
      $ui.error("error200");
    }
  }
  go(site, version, isCopy) {
    $console.info({
      version,
      site,
      isCopy
    });
    const versionInfo =
      version === "lts"
        ? this.LastestVersionData.lts
        : this.LastestVersionData.current;
    const verId = `${version}_${site}`;
    const verCode = this.LastestVersionData[version];
    if (isCopy === true) {
      this.Mod.Util.copy(
        `${this.VersionData[verId].name}:Update to v${versionInfo.version}`
      );
    } else {
      this.shareData(
        site,
        version,
        versionInfo.version,
        versionInfo.x64hash,
        versionInfo.x86hash
      );
    }
  }
  async init() {
    $ui.loading(true);
    $ui.warning("正在加载最新数据");
    this.VersionFile = await this.DataGetter.getVersionList();
    if (this.VersionFile === undefined || this.VersionFile.length === 0) {
      $ui.loading(false);
      $ui.error("获取最新数据失败");
    } else {
      this.loadingLastestData()
        .then(result => {
          $ui.loading(false);
          const items = [
            {
              title: `LTS:v${this.LastestVersionData.lts.version}`,
              rows: [
                "导出taobao",
                "导出tuna",
                "复制taobao更新日志",
                "复制tuna更新日志"
              ]
            },
            {
              title: `CURRENT:v${this.LastestVersionData.current.version}`,
              rows: [
                "导出taobao",
                "导出tuna",
                "复制taobao更新日志",
                "复制tuna更新日志"
              ]
            }
          ];

          $ui.push({
            props: {
              title: "Node.js"
            },
            views: [
              {
                type: "list",
                props: {
                  data: items
                },
                layout: $layout.fill,
                events: {
                  didSelect: (sender, indexPath, data) => {
                    const { section, row } = indexPath;
                    switch (section) {
                      case 0:
                        switch (row) {
                          case 0:
                            this.go("taobao", "lts", false);
                            break;
                          case 1:
                            this.go("tuna", "lts", false);
                            break;
                          case 2:
                            this.go("taobao", "lts", true);
                            break;
                          case 3:
                            this.go("tuna", "lts", true);
                            break;
                          default:
                        }
                        break;
                      case 1:
                        switch (row) {
                          case 0:
                            this.go("taobao", "current", false);
                            break;
                          case 1:
                            this.go("tuna", "current", false);
                            break;
                          case 2:
                            this.go("taobao", "current", true);
                            break;
                          case 3:
                            this.go("tuna", "current", true);
                            break;
                          default:
                        }
                        break;
                      default:
                    }
                  }
                }
              }
            ]
          });
        })
        .catch(error => {
          $ui.loading(false);
          $console.error(error);
          $ui.alert({
            title: "Error",
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
    }
  }
  loadingLastestData() {
    return new Promise(async (resolve, reject) => {
      try {
        const ltsVersion = this.DataGetter.getLastestVersion(
            this.VersionFile,
            true
          ),
          currentVersion = this.DataGetter.getLastestVersion(this.VersionFile);
        const ltsHashFile = await this.DataGetter.getHashData(ltsVersion),
          currentHashFile = await this.DataGetter.getHashData(currentVersion);
        this.LastestVersionData.lts = ltsHashFile;
        this.LastestVersionData.current = currentHashFile;
        $console.info({
          LastestVersionData: this.LastestVersionData,
          ltsHashFile,
          currentHashFile
        });
        resolve(true);
      } catch (error) {
        $console.error(error);
        reject(error);
      }
    });
  }
}
class ScoopModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "scoop.nodejs",
      name: "Scoop Node.js规则生成器",
      version: "1"
      //author: "zhihaofans"
    });
    this.DataGetter = new DataGetter();
  }
  initUi() {
    //    $ui.success("run");
    new NodejsView(this).init();
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
  getFileName(version, site) {
    return this.DataGetter.VersionData[version + "-" + site];
  }
  getUpdateNote(version) {
    return new Promise((resolve, reject) => {
      resolve("nodejs: Update to v"+version);
    });
  }
  getVersionList() {
    if (this.hasMultipleVersion() === true) {
      return Object.keys(this.DataGetter.VersionData);
    } else {
      return undefined;
    }
  }
  hasMultipleVersion() {
    return true;
  }
}
module.exports = ScoopModule;
