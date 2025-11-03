const { ModModule } = require("CoreJS"),
  $ = require("$");

class AuthData {
  constructor(KeychainKit) {
    this.Keychain = KeychainKit;
    this.data_key = {
      cookie: "bilibili.cookie",
      SESSDATA: "bilibili.cookie.sessdata"
    };
  }
  isLogin() {
    return $.hasString(this.getCookie()) && $.hasString(this.getSESSDATA());
  }
  getCookie() {
    return this.Keychain.get(this.data_key.cookie);
  }
  getSESSDATA() {
    return this.Keychain.get(this.data_key.SESSDATA);
  }
  setCookie(cookie) {
    const cookieSu = this.Keychain.set(this.data_key.cookie, cookie);
    return cookieSu;
  }
  setSESSDATA(value) {
    return this.Keychain.set(this.data_key.SESSDATA, value);
  }
}
class BiliModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.auth",
      name: "哔哩哔哩登录数据",
      version: "1"
    });
    this.Data = new AuthData(mod.Keychain);
  }

  getCookie() {
    return this.Data.getCookie();
  }
  getSESSDATA() {
    return this.Data.getSESSDATA();
  }
  isLogin() {
    return this.Data.isLogin();
  }
  setCookie(cookie) {
    return this.Data.setCookie(cookie);
  }
  setSESSDATA(value) {
    return this.Data.setSESSDATA(value);
  }
}
module.exports = BiliModule;
