const { CoreModule } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class UserData {
  constructor(keychain) {
    this.Keychain = keychain;
  }
  cookie(cookieStr) {
    const keychainId = "user.login.cookie";
    if (cookieStr != undefined && cookieStr.length > 0) {
      this.Keychain.set(keychainId, cookieStr);
    }
    return this.Keychain.get(keychainId);
  }
}

class UserLogin {
  constructor(core) {
    this.Http = core.Http;
    this.Data = new UserData(core.Keychain);
  }
  isLogin() {
    return this.Data.cookie().length > 0;
  }
  login() {}
  async getWebLoginKey() {
    $ui.loading(true);
    const url = "https://passport.bilibili.com/qrcode/getLoginUrl",
      header = {},
      timeout = 5,
      res = await this.Http.get({
        url,
        header,
        timeout
      }),
      result = res.data;
    $console.warn({ res });
    if (result && result.status == true && result.code == 0) {
      const qrcodeData = result.data,
        //ts = result.ts,
        qrcodeUrl = qrcodeData.url,
        oauthKey = qrcodeData.oauthKey,
        qrcodeImage = $qrcode.encode(qrcodeUrl),
        obj = new Object();
      obj.url = qrcodeUrl;
      obj.oauthKey = oauthKey;
      return obj;
    }
    return undefined;
  }
  async loginByWebOauthkey(oauthkey) {
    if (oauthkey != undefined && oauthkey.length > 0) {
      const timeout = 5,
        url = `https://passport.bilibili.com/qrcode/getLoginInfo?oauthKey=${oauthKey}`,
        resp = await this.Http.post({
          url,
          timeout
        });
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
          //cookie
          const cookie = { DedeUserID, DedeUserID__ckMd5, SESSDATA, bili_jct },
            success = this.Data.cookie(JSON.stringify(cookie));
          $console.info({ scanTs, cookie, success });
          return cookie;
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
      }
    } else {
    }
  }
}

class BilibiliUser extends CoreModule {
  constructor(core) {
    super({
      coreId: "bilibili",
      moduleId: "bilibili.user",
      moduleName: "哔哩哔哩用户模块",
      version: "1",
      author: "zhihaofans"
    });
    this.Login = new UserLogin(core);
  }
  getCookie() {
    return this.Login.Data.cookie();
  }
  isLogin() {
    return this.Login.isLogin();
  }
}
module.exports = BilibiliUser;
