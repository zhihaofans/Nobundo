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
      access_key: "bilibili.access_key",
      cookie: "bilibili.cookie",
      csrf: "bilibili.csrf",
      DedeUserID: "bilibili.dede_user_id",
      DedeUserID__ckMd5: "bilibili.dede_user_id_ckmd5",
      SESSDATA: "bilibili.cookie.sessdata"
    };
  }
  getAccessKey() {
    return this.Keychain.get(this.data_key.access_key);
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
  getDedeUserID() {
    const cookieJson = cookieToObject(this.getCookie());
    $console.info({
      cookieJson
    });
    return cookieJson["DedeUserID"];
  }
  getDedeUserID__ckMd5() {
    const cookieJson = cookieToObject(this.getCookie());
    $console.info({
      cookieJson
    });
    return cookieJson["DedeUserID__ckMd5"];
  }
  getSESSDATA() {
    return this.Keychain.get(this.data_key.SESSDATA);
  }
  isLogin() {
    return $.hasString(this.getCookie()) && $.hasString(this.getSESSDATA());
  }
  setAccess_key(access_key) {
    const su = this.Keychain.set(this.data_key.access_key, access_key);
    return su;
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
  getAccessKey() {
    return this.Data.getAccessKey();
  }
  getCookie() {
    return this.Data.getCookie();
  }
  getCsrf() {
    return this.Data.getCsrf();
  }
  getDedeUserID() {
    return this.Data.getDedeUserID();
  }
  getDedeUserID__ckMd5() {
    return this.Data.getDedeUserID__ckMd5();
  }
  getSESSDATA() {
    return this.Data.getSESSDATA();
  }
  isLogin() {
    return this.Data.isLogin();
  }
  setAccessKey(access_key) {
    return this.Data.setAccess_key(access_key);
  }
  setCookie(cookie) {
    return this.Data.setCookie(cookie);
  }
  setSESSDATA(value) {
    return this.Data.setSESSDATA(value);
  }
}
module.exports = BiliModule;
