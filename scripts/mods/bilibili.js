const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class DataStorage {
  constructor(core) {
    this.Core = core;
    this.Keychain = core.Keychain;
    this.STORAGE_TYPE = {
      CACHE: 0,
      PREFS: 1,
      SQLITE: 2,
      KEYCHAIN: 3
    };
  }
  saveData({ type, id, data }) {
    if (id.length > 0 && data.length > 0) {
      switch (type) {
        case this.STORAGE_TYPE.KEYCHAIN:
          return this.Keychain.set(id, data);
          break;
        default:
          return undefined;
      }
    } else {
      return undefined;
    }
  }
  loadData({ type, id, defaultData }) {
    if (id.length > 0) {
      switch (type) {
        case this.STORAGE_TYPE.KEYCHAIN:
          return this.Keychain.get(id) || defaultData;
          break;
        default:
          return undefined;
      }
    } else {
      return undefined;
    }
  }
}

class User {
  constructor({ core }) {
    this.Core = core;
    this.Api = new BilibiliApi({ core });
    this.DS = new DataStorage(core);
  }
  async loginByQrcode() {
    $ui.loading(true);
    const result = await this.Api.getWebLoginQrcode();
    if (result && result.status == true && result.code == 0) {
      const qrcodeData = result.data,
        ts = result.ts,
        qrcodeUrl = qrcodeData.url,
        oauthKey = qrcodeData.oauthKey,
        qrcodeImage = $qrcode.encode(qrcodeUrl);
      $ui.loading(false);
      this.DS.saveData({
        type: this.DS.STORAGE_TYPE.KEYCHAIN,
        id: "user.login.qrcode.oauthkey",
        data: oauthKey
      });
      this.DS.saveData({
        type: this.DS.STORAGE_TYPE.KEYCHAIN,
        id: "user.login.qrcode.oauthkey.ts",
        data: ts
      });
      $ui.push({
        props: {
          title: "扫描二维码"
        },
        views: [
          {
            type: "list",
            props: {
              data: [
                {
                  title: "点击登录",
                  rows: ["显示二维码", "已经扫好"]
                },
                {
                  title: "二维码Token",
                  rows: [oauthKey]
                }
              ]
            },
            layout: $layout.fill,
            events: {
              didSelect: (_sender, indexPath, _data) => {
                const section = indexPath.section;
                const row = indexPath.row;
                switch (section) {
                  case 0:
                    switch (row) {
                      case 0:
                        $quicklook.open({
                          image: qrcodeImage
                        });

                        break;
                      case 1:
                        this.Api.loginByWebQrcode(oauthKey);
                        break;
                    }
                    break;
                  case 1:
                    switch (row) {
                      case 0:
                        $share.sheet({
                          items: [
                            {
                              name: "bilibili_login_qrcode_web_oauthkey.txt",
                              data: oauthKey
                            }
                          ], // 也支持 item
                          handler: success => {
                            $console.warn(success);
                          }
                        });
                        break;
                    }

                    break;
                }
              }
            }
          }
        ]
      });
    } else {
      $ui.loading(false);
      $ui.alert({
        title: "登录失败",
        message: `获取二维码错误，代码${result.code}`,
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    }
  }
  async checkQrcodeStatus(token) {
    const oauthKey = this.DS.loadData({
        type: this.DS.STORAGE_TYPE.KEYCHAIN,
        id: "user.login.qrcode.oauthkey"
      }),
      ts = this.DS.loadData({
        type: this.DS.STORAGE_TYPE.KEYCHAIN,
        id: "user.login.qrcode.ts"
      });
    if (token.length > 0) {
      if (
        token !== oauthKey ||
        this.Core.$.time.getSecondUnixTime() >= ts + 180
      ) {
      }
      const result = await this.Api.loginByWebQrcode(token);
      if (result) {
      } else {
      }
    } else {
      return undefined;
    }
  }
}
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
  async getWebLoginQrcode() {
    const url = "http://passport.bilibili.com/qrcode/getLoginUrl",
      header = {},
      timeout = 5,
      result = await this.$.http.get({
        url,
        header,
        timeout
      });
    $console.warn(result);
    return result.data;
  }
  async loginByWebQrcode(oauthKey) {
    $console.info(oauthKey);
    const url = "http://passport.bilibili.com/qrcode/getLoginInfo",
      header = {},
      timeout = 5,
      gourl = "http://www.bilibili.com/",
      body = { oauthKey, gourl },
      result = await this.$.http.post({
        url,
        header,
        timeout,
        body
      });
    $console.warn(result);
    return result.data;
  }
}

class Main {
  constructor(core) {
    this.Core = core;
    this.Kernel = core.kernel;
    this.User = new User({ core });
  }
  init() {
    const mainViewList = ["扫描二维码登录"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.User.loginByQrcode();
            break;
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
