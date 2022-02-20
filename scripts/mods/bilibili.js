const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  { ModuleLoader } = require("../../Core.js/core.module"),
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
        default:
          return undefined;
      }
    } else {
      return undefined;
    }
  }
  removeData({ type, id }) {
    if (id.length > 0) {
      switch (type) {
        case this.STORAGE_TYPE.KEYCHAIN:
          return this.Keychain.remove(id);
        default:
          return undefined;
      }
    } else {
      return undefined;
    }
  }
  setKeychain(key, value) {
    return this.Keychain.set(key, value);
  }
  getKeychain(key, defaultValue = undefined) {
    return this.Keychain.get(key) || defaultValue;
  }
}

class User {
  constructor({ core }) {
    this.Core = core;
    this.Api = new BilibiliApi({ core });
    this.DS = new DataStorage(core);
  }
  loginByQrcode() {
    $ui.menu({
      items: [
        "网页登录",
        "电视登录",
        "手动输入网页二维码token",
        "手动输入电视二维码token",
        "查看Cookies"
      ],
      handler: (title, idx) => {
        switch (idx) {
          case 0:
            this.loginByWebQrcode();
            break;
          case 2:
            this.inputWebQrcodeOauthkey();
            break;
          case 4:
            $ui.alert({
              title: "Cookies",
              message: this.getCookies(),
              actions: [
                {
                  title: "OK",
                  disabled: false,
                  handler: () => {}
                },
                {
                  title: "删除",
                  disabled: false,
                  handler: () => {
                    const success = this.removeCookies();
                    $console.info({ success });
                  }
                }
              ]
            });
            break;
        }
      },
      finished: cancelled => {
        $console.info({ "ui.menu": { cancelled } });
      }
    });
  }
  async loginByWebQrcode() {
    $ui.loading(true);
    const result = await this.Api.getWebLoginQrcode();
    if (result && result.status == true && result.code == 0) {
      const qrcodeData = result.data,
        ts = result.ts,
        qrcodeUrl = qrcodeData.url,
        oauthKey = qrcodeData.oauthKey,
        qrcodeImage = $qrcode.encode(qrcodeUrl);
      $ui.loading(false);
      this.DS.setKeychain("user.login.qrcode.oauthkey", oauthKey);
      this.DS.setKeychain("user.login.qrcode.oauthkey.ts", ts);
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
                        this.checkWebQrcodeStatus(oauthKey);
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
                          ],
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
  inputWebQrcodeOauthkey() {
    $input.text({
      type: $kbType.text,
      placeholder: "请输入二维码token",
      handler: oauthKey => {
        if (oauthKey.length > 0) {
          this.checkWebQrcodeStatus(oauthKey);
        }
      }
    });
  }
  async checkWebQrcodeStatus(token) {
    const oauthKey = this.DS.getKeychain("user.login.qrcode.oauthkey"),
      ts = this.DS.getKeychain("user.login.qrcode.ts");
    $console.info({
      oauthKey,
      ts,
      token
    });
    if (token.length > 0) {
      if (token == oauthKey) {
        if (this.Core.$.time.getSecondUnixTime() >= ts + 180) {
          this.DS.removeData({
            type: this.DS.STORAGE_TYPE.KEYCHAIN,
            id: "user.login.qrcode.oauthkey"
          });
          this.DS.removeData({
            type: this.DS.STORAGE_TYPE.KEYCHAIN,
            id: "user.login.qrcode.ts"
          });
          $console.error("二维码token过期");
          return undefined;
        }
      } else if (token !== oauthKey) {
        this.DS.removeData({
          type: this.DS.STORAGE_TYPE.KEYCHAIN,
          id: "user.login.qrcode.oauthkey"
        });
        this.DS.removeData({
          type: this.DS.STORAGE_TYPE.KEYCHAIN,
          id: "user.login.qrcode.ts"
        });
        $console.warn("已删除旧二维码token");
      }
      const resp = await this.Api.loginByWebQrcode(token);
      if (resp.data) {
        const result = resp.data,
          response = resp.response;
        $console.info(result);
        $console.info(response.headers);
        if (result.status) {
          const scanTs = result.ts,
            setCookie = response.headers["Set-Cookie"];
          //DedeUserID
          const DedeUserID_left = setCookie.indexOf("DedeUserID=") + 11,
            DedeUserID_right = setCookie.indexOf(";", DedeUserID_left + 1),
            DedeUserID = setCookie.substring(DedeUserID_left, DedeUserID_right);
          //DedeUserID__ckMd5
          const DedeUserID__ckMd5_left =
              setCookie.indexOf("DedeUserID__ckMd5=") + 18,
            DedeUserID__ckMd5_right = setCookie.indexOf(
              ";",
              DedeUserID__ckMd5_left + 1
            ),
            DedeUserID__ckMd5 = setCookie.substring(
              DedeUserID__ckMd5_left,
              DedeUserID__ckMd5_right
            );
          //SESSDATA
          const SESSDATA_left = setCookie.indexOf("SESSDATA=") + 9,
            SESSDATA_right = setCookie.indexOf(";", SESSDATA_left + 1),
            SESSDATA = setCookie.substring(SESSDATA_left, SESSDATA_right);
          //bili_jct
          const bili_jct_left = setCookie.indexOf("bili_jct=") + 9,
            bili_jct_right = setCookie.indexOf(";", bili_jct_left + 1),
            bili_jct = setCookie.substring(bili_jct_left, bili_jct_right);

          //cookies
          const cookies = { DedeUserID, DedeUserID__ckMd5, SESSDATA, bili_jct };
          $console.info({ scanTs, cookies });
          const success = this.DS.setKeychain(
            "user.login.cookies",
            JSON.stringify(cookies)
          );
          $console.info({ success });
        } else {
          $ui.alert({
            title: "错误",
            message: result.message,
            actions: [
              {
                title: "OK",
                disabled: false,
                handler: () => {}
              }
            ]
          });
        }
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
  checkLoginCache() {
    $ui.menu({
      items: ["查看Cookies"],
      handler: (title, idx) => {
        switch (idx) {
          case 0:
            const cookies = this.getCookies();
            $ui.alert({
              title: "Cookies",
              message: cookies,
              actions: [
                {
                  title: "OK",
                  disabled: false,
                  handler: () => {}
                },
                {
                  title: "分享",
                  disabled: false,
                  handler: () => {
                    $share.sheet({
                      items: [
                        {
                          name: "bilibili_user_cookies.txt",
                          data: JSON.stringify(cookies)
                        }
                      ],
                      handler: success => {
                        $console.info({ success });
                      }
                    });
                  }
                },
                {
                  title: "删除",
                  disabled: false,
                  handler: () => {
                    this.removeCookies();
                  }
                }
              ]
            });
            break;
        }
      },
      finished: cancelled => {
        $console.info({ "ui.menu": { cancelled } });
      }
    });
  }
  removeCookies() {
    const success = this.DS.removeData({
      type: this.DS.STORAGE_TYPE.KEYCHAIN,
      id: "user.login.cookies"
    });
    $console.info({ success });
  }
  getCookies() {
    const cookies = JSON.parse(this.DS.getKeychain("user.login.cookies"));
    $console.info({ cookies });
    return cookies;
  }
  async getUserInfo() {
    const cookie = this.getCookies(),
      userInfoResult = await this.Api.getUserInfo(
        this.Core.$.http.getCookiesStrFromObj(cookie)
      );
    $console.info({ userInfoResult });
    $ui.alert({
      title: "用户信息",
      message: JSON.parse(userInfoResult),
      actions: [
        {
          title: "OK",
          disabled: false,
          handler: () => {}
        }
      ]
    });
  }
}
class Vip {
  constructor({ core }) {
    this.Core = core;
    this.$ = core.$;
    this.User = new User({ core });
  }
  async getPrivilegeStatus() {
    $ui.loading(true);
    const cookie = this.User.getCookies(),
      header = { cookie },
      url = "https://api.bilibili.com/x/vip/privilege/my",
      timeout = 5,
      resp = await this.$.http.get({
        url,
        header,
        timeout
      }),
      response = resp.response;
    $console.info({ resp });
    $ui.loading(false);
    if (resp.error) {
      $ui.alert({
        title: `请求错误(${response.code})`,
        message: resp.error.localizedDescription,
        actions: [
          {
            title: "OK",
            disabled: false,
            handler: () => {}
          }
        ]
      });
    } else {
      const result = resp.data;
      if (result.code == 0) {
        const privilegeList = result.data.list,
          privilegeStr = { 1: "B币", 2: "会员购优惠券", 3: "漫画福利券" },
          didSelect = (sender, indexPath, data) => {
            $console.info({
              indexPath
            });
            const thisPrivilege = privilegeList[indexPath.row];
            if (thisPrivilege.state == 1) {
              $ui.alert({
                title: "领取失败",
                message: privilegeStr[thisPrivilege.type] + "已领取",
                actions: [
                  {
                    title: "OK",
                    disabled: false, // Optional
                    handler: () => {}
                  }
                ]
              });
            } else {
              this.receivePrivilege(thisPrivilege.type);
            }
          };
        listKit.pushString(
          "大会员特权",
          privilegeList.map(privilege => {
            const privilegeStatus =
              privilege.state == 1 ? "(已领取)" : "未领取";
            return privilegeStr[privilege.type] + privilegeStatus;
          }),
          didSelect
        );
      } else {
        $ui.alert({
          title: `请求失败(${result.code})`,
          message: result.message,
          actions: [
            {
              title: "OK",
              disabled: false,
              handler: () => {}
            }
          ]
        });
      }
    }
  }
  async receivePrivilege(typeId) {
    $ui.loading(true);
    const cookie = this.User.getCookies(),
      header = { cookie },
      bili_jct = cookie.bili_jct,
      url = `https://api.bilibili.com/x/vip/privilege/receive?type=${typeId}&csrf=${bili_jct}`,
      timeout = 5,
      resp = await this.$.http.post({
        url,
        header,
        timeout
      }),
      response = resp.response,
      resultCodeList = {
        "-101": "账号未登录",
        "-111": "csrf 校验失败",
        "-400": "请求错误",
        "69800": "网络繁忙 请稍后再试",
        "69801": "你已领取过该权益",
        "0": "成功"
      };
    $console.info({ resp });
    $ui.loading(false);
    if (resp.error) {
      $ui.alert({
        title: `请求错误(${response.code})`,
        message: resp.error.localizedDescription,
        actions: [
          {
            title: "OK",
            disabled: false,
            handler: () => {}
          }
        ]
      });
    } else {
      const result = resp.data;
      if (result.code == 0) {
        $ui.alert({
          title: "领取成功",
          message: "",
          actions: [
            {
              title: "OK",
              disabled: false,
              handler: () => {}
            }
          ]
        });
      } else {
        $ui.alert({
          title: `领取失败(${result.code})`,
          message: resultCodeList[result.code.toString()],
          actions: [
            {
              title: "OK",
              disabled: false,
              handler: () => {}
            }
          ]
        });
      }
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
    const header = {},
      timeout = 5,
      appkey = "4409e2ce8ffd12b8",
      appSec = this.getAppsecByAppkey(appkey),
      local_id = "0",
      ts = new Date().getTime(),
      params = { appkey, local_id, ts },
      sign = this.getSign(params, appkey, appSec),
      url = `https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code?appkey=${appkey}&appSec=${appSec}&ts=${ts}&sign=${sign}`,
      result = this.$.http.post({
        url,
        header,
        timeout
      });
    $console.info({ params, appSec, url });
    return result;
  }
  async getWebLoginQrcode() {
    const url = "https://passport.bilibili.com/qrcode/getLoginUrl",
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
    const header = {},
      timeout = 5,
      gourl = "https://www.bilibili.com/",
      url = `https://passport.bilibili.com/qrcode/getLoginInfo?oauthKey=${oauthKey}&gourl=${gourl}`,
      result = await this.$.http.post({
        url,
        header,
        timeout
      });
    $console.warn(result);
    return result;
  }
  async getUserInfo(cookie) {
    const url = "https://api.bilibili.com/x/web-interface/nav",
      header = { cookie },
      timeout = 5,
      result = await this.$.http.get({
        url,
        header,
        timeout
      });
    $console.info({ result });
    return result.data;
  }
}

class Main {
  constructor(core) {
    this.Core = core;
    this.User = new User({ core });
    this.Vip = new Vip({ core });
    this.Api = this.Core.ModuleLoader.getModule("bilibili.api");
    this.Video = this.Api.getVideo();
  }
  init() {
    const mainViewList = [
        "扫描二维码登录",
        "查看登录数据",
        "查看用户信息",
        "查看大会员特权",
        "稍后再看"
      ],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.User.loginByQrcode();
            break;
          case 1:
            this.User.checkLoginCache();
            break;
          case 2:
            this.User.getUserInfo();
            break;
          case 3:
            this.Vip.getPrivilegeStatus();
            break;
          case 4:
            this.Video.getLaterToWatch(this.User.getCookies());
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
      modId: "bilibili",
      modName: "哔哩哔哩",
      version: "5b",
      author: "zhihaofans",
      needCoreVersion: 3,
      databaseId: "bilibili",
      keychainId: "bilibili"
    });
    this.ModuleLoader = new ModuleLoader(this);
  }
  run() {
    this.ModuleLoader.addModule("bilibili.api.js");
    const main = new Main(this);
    main.init();
  }
}
module.exports = Bilibili;
