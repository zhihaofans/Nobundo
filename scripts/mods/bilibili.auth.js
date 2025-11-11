const { ModModule } = require("CoreJS"),
  $ = require("$");
function cookieToObject(cookieStr) {
  const cookieParts = cookieStr.split(/,(?=\s*[a-zA-Z0-9_-]+=)/);

  const cookies = {};
  for (const part of cookieParts) {
    const match = part.match(/^\s*([^=]+)=([^;]+)/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      cookies[key] = value;
    }
  }
  return cookies;
}
class AuthData {
  constructor(KeychainKit) {
    this.Keychain = KeychainKit;
    this.data_key = {
      cookie: "bilibili.cookie",
      csrf: "bilibili.csrf",
      SESSDATA: "bilibili.cookie.sessdata"
    };
  }
  getCookie() {
    return this.Keychain.get(this.data_key.cookie);
  }
  getCsrf() {
    const cookieJson = cookieToObject(this.getCookie());
    $console.info({
      cookieJson
    });
    return cookieJson["bili_jct"];
  }
  getSESSDATA() {
    return this.Keychain.get(this.data_key.SESSDATA);
  }
  isLogin() {
    return $.hasString(this.getCookie()) && $.hasString(this.getSESSDATA());
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
  getCsrf() {
    return this.Data.getCsrf();
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
