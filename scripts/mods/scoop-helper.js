const { Core } = require("../../Core.js/core");
class AppGetter {
  constructor(core) {
    this._Core = core;
    this._Http = core.Http;
  }
  async _get(url) {
    const res = await this.Http.get({
        url,
        header: {},
        timeout: 5
      }),
      result = res.data;
    $console.info({ res });
    if (res.error != undefined) {
      $console.error(res.error);
    }
    return result;
  }
}

class AppInfo {
  constructor({
    version,
    description,
    homepage,
    license,
    architecture: { url, hash, extract_dir },
    persist,
    env_add_path,
    post_install
  }) {
    this.NAME = name;
  }
}
class NodeLts extends AppGetter {
  constructor(core) {
    super(core);
    //this.Http = core.Http;
  }
  async getOnlineHash(version, site = "official") {
    const urlList = {
        official: `https://nodejs.org/dist/v${version}/SHASUMS256.txt`,
        taobao: `https://cdn.npmmirror.com/binaries/node/v${version}/SHASUMS256.txt`,
        tuna: `https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/v${version}/SHASUMS256.txt`
      },
      hashUrl = urlList[site] || urlList.official,
      result = await this._get(hashUrl);
    if (result != undefined && result.length > 0) {
      const hashListLeft = result.indexOf("Hash: SHA256") + 12,
        hashListRight = result.indexOf(
          "-----BEGIN PGP SIGNATURE-----",
          hashListLeft
        ),
        hashListStr = result.substring(hashListLeft, hashListRight);
      $console.info(hashListStr);

      //$console.info(result);
    }
  }
}

class Example extends Core {
  constructor(app) {
    super({
      app,
      modId: "scoop-helper",
      modName: "Scoop小助手",
      version: "1",
      author: "zhihaofans",
      coreVersion: 5
    });
  }
  run() {}
  runWidget() {
    const inputValue = $widget.inputValue ? `[${$widget.inputValue}]` : "";
    $widget.setTimeline({
      render: ctx => {
        return {
          type: "text",
          props: {
            text: `${inputValue}Hello, Example!`
          }
        };
      }
    });
  }
  runApi({ url, data, callback }) {
    //TODO:允许其他Mod调用
    this.allowApi = true;
  }
}
module.exports = Example;
