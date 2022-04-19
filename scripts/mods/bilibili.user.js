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
        ts = result.ts,
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
        gourl = "https://www.bilibili.com/",
        url = `https://passport.bilibili.com/qrcode/getLoginInfo?oauthKey=${oauthKey}&gourl=${gourl}`,
        res = await this.Http.post({
          url,
          timeout
        });
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
