const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  Http = new Next.Http(5),
  $ = require("$"),
  ListViewKit = new Next.ListView();
class DataGetter {
  constructor(mod) {}
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
  toFormatJson(json) {
    return JSON.stringify(json, null, 2);
  }
}
class NodejsView {
  constructor(_module) {
    this.Module = _module;
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
  }
  shareData(site, versionCode, version, x64hash, x86hash) {
    const fileNameList = {
        "taobao.lts": "Nodejs-LTS-TaobaoMirror.json",
        "tuna.lts": "Nodejs-LTS-tuna.json",
        "taobao.current": "Nodejs-TaobaoMirror.json"
      },
      fileName = fileNameList[`${site}.${versionCode}`];
    $console.info({
      fileName,
      site,
      version,
      x64hash,
      x86hash
    });
    let jsonData = {};
    switch (site.toLowerCase()) {
      case "tuna":
        jsonData = this.DataGetter.tuna({
          version,
          x64hash,
          x86hash
        });
        break;
      case "taobao":
        jsonData = this.DataGetter.taobao({
          version,
          x64hash,
          x86hash
        });
        break;
      default:
        $ui.error("未知站点");
        return undefined;
    }

    $share.sheet([
      {
        name: fileName,
        data: this.DataGetter.toFormatJson(jsonData)
      }
    ]);
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
              rows: ["taobao", "tuna"]
            },
            {
              title: `CURRENT:v${this.LastestVersionData.current.version}`,
              rows: ["taobao", "tuna"]
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
                            this.shareData(
                              "taobao",
                              "lts",
                              this.LastestVersionData.lts.version,
                              this.LastestVersionData.lts.x64hash,
                              this.LastestVersionData.lts.x86hash
                            );
                            break;
                          case 1:
                            this.shareData(
                              "tuna",
                              "lts",
                              this.LastestVersionData.lts.version,
                              this.LastestVersionData.lts.x64hash,
                              this.LastestVersionData.lts.x86hash
                            );
                            break;
                          default:
                        }
                        break;
                      case 1:
                        switch (row) {
                          case 0:
                            this.shareData(
                              "taobao",
                              "current",
                              this.LastestVersionData.current.version,
                              this.LastestVersionData.current.x64hash,
                              this.LastestVersionData.current.x86hash
                            );
                            break;
                          case 1:
                            this.shareData(
                              "tuna",
                              "current",
                              this.LastestVersionData.current.version,
                              this.LastestVersionData.current.x64hash,
                              this.LastestVersionData.current.x86hash
                            );
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
class ScoopNodejs extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "scoop.nodejs",
      name: "scoop.nodejs",
      version: "1"
      //author: "zhihaofans"
    });
  }
  initUi() {
    //    $ui.success("run");
    new NodejsView(this).init();
  }
}
module.exports = ScoopNodejs;
