const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class BilibiliApi {
  constructor({ core }) {
    this.Core = core;
    this.$ = core.$;
    this.Http = new this.Core.Http(5);
  }
  getAppsecByAppkey(appkey) {
    const keyAndSec = {
      "07da50c9a0bf829f": "25bdede4e1581c836cab73a48790ca6e",
      "1d8b6e7d45233436": "560c52ccd288fed045859ed18bffd973",
      "178cf125136ca8ea": "34381a26236dd1171185c0beb042e1c6",
      "27eb53fc9058f8c3": "c2ed53a74eeefe3cf99fbd01d8c9c375",
      "37207f2beaebf8d7": "e988e794d4d4b6dd43bc0e89d6e90c43",
      "4409e2ce8ffd12b8": "59b43e04ad6965f34319062b478f83dd",
      "57263273bc6b67f6": "a0488e488d1567960d3a765e8d129f90",
      "7d336ec01856996b": "a1ce6983bc89e20a36c37f40c4f1a0dd",
      "85eb6835b0a1034e": "2ad42749773c441109bdc0191257a664",
      "8e16697a1b4f8121": "f5dd03b752426f2e623d7badb28d190a",
      "aae92bc66f3edfab": "af125a0d5279fd576c1b4418a3e8276d",
      "ae57252b0c09105d": "c75875c596a69eb55bd119e74b07cfe3",
      "bb3101000e232e27": "36efcfed79309338ced0380abd824ac1",
      "bca7e84c2d947ac6": "60698ba2f68e01ce44738920a0ffe768",
      "iVGUTjsxvpLeuDCf": "aHRmhWMLkdeMuILqORnYZocwMBpMEOdt",
      "YvirImLGlLANCLvM": "JNlZNgfNGKZEpaDTkCdPQVXntXhuiJEM"
    };
    return keyAndSec[appkey];
  }
  getSign(params, appkey, appSec) {
    let paramsStr = "";
    Object.keys(params).map(param => {
      if (paramsStr.length == 0) {
        paramsStr = `${param}=${params[param]}`;
      } else {
        paramsStr += `&${param}=${params[param]}`;
      }
    });
    const sign = $text.URLEncode($text.URLEncode(paramsStr) + appSec);
    $console.info(sign);
    return $text.MD5(sign);
  }
  getTvLoginQrcode() {
    const url =
        "http://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code",
      header = {},
      timeout = 5,
      appkey = "4409e2ce8ffd12b8",
      appSec = this.getAppsecByAppkey(appkey),
      local_id = "0",
      ts = new Date().getTime(),
      params = { appkey, local_id, ts },
      sign = this.getSign(params, appkey, appSec),
      body = Object.assign(
        {
          sign
        },
        params
      );
    $console.info({ params, appSec, body });
    return this.$.http.post({
      url,
      header,
      timeout,
      body
    });
  }
  getWebLoginQrcode() {
    const url = "http://passport.bilibili.com/qrcode/getLoginUrl",
      header = {},
      timeout = 5;
    return this.$.http.get({
      url,
      header,
      timeout
    }).data;
  }
}

class Main {
  constructor(core) {
    this.Core = core;
    this.Kernel = core.kernel;
    this.Http = new core.Http(5);
    this.$ = core.$;
    this.Api = new BilibiliApi({
      core
    });
  }
  async test() {
    const result = await this.Api.getTvLoginQrcode();
    $console.warn(result);
  }
  init() {
    const mainViewList = ["example 1"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          default:
            $ui.alert({
              title: indexPath.row,
              message: data,
              actions: [
                {
                  title: "OK",
                  disabled: false, // Optional
                  handler: () => {
                    this.test();
                  }
                }
              ]
            });
        }
      };
    listKit.pushString(this.Core.MOD_NAME, mainViewList, didSelect);
  }
}

class Bilibili extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      modName: "Bilibili",
      version: "5a",
      author: "zhihaofans",
      needCoreVersion: 3,
      databaseId: "bilibili",
      keychainId: "bilibili"
    });
  }
  run() {
    $ui.success("run");
    const main = new Main(this);
    main.init();
  }
}
module.exports = Bilibili;
