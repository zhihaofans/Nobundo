const { ModModule } = require("CoreJS"),
  $ = require("$"),
  Next = require("Next");
const APP_VERSION = "0.0.1",
  APP_NAME = "tikhub-api";
const API_HOST = "https://api.tikhub.dev/";
class TKResult {
  constructor(json) {
    //this.json = JSON.parse(result);
    this.code = json.code;
    this.message = json.message_zh || json.message;
    this.share_url = json.params.share_url;
    this.video_id = json.params.aweme_id;
    this.data = json.data.aweme_detail;
  }
}
class HttpCore {
  constructor(_module) {
    this.Module = _module;
    this.Http = new Next.Http(5);
  }
  getHeader() {
    const token = this.Module.DataCore.getApiToken();
    $console.info({
      token
    });
    return {
      "User-Agent": `${APP_NAME}(${APP_VERSION})`,
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
      "Cookie": "Authorization=Bearer " + token
    };
  }
  get(url, params) {
    return new Promise((resolve, reject) => {
      this.Http.get({
        url,
        params,
        header: this.getHeader()
      }).then(
        resp => {
          $console.info(resp);
          const { statusCode } = resp.response;
          const result = resp.data;
          const tkRe = new TKResult(
            result || {
              code: statusCode,
              message: "no resp.data"
            }
          );
          if (statusCode !== 200) {
            tkRe.url = url;
            tkRe.params = params;
          }
          $console.info({
            tkRe
          });
          resolve(tkRe);
        },
        fail => {
          const result = new TKResult({
            code: -1,
            message: "http.get fail",
            url,
            params
          });
          fail(result);
        }
      );
    });
  }
  getThen(url, params) {
    return this.Http.get({
      url,
      params,
      header: this.getHeader()
    });
  }
  postThen(url, body, params) {
    return this.Http.post({
      url,
      body,
      params,
      header: this.getHeader()
    });
  }
}
class DataCore {
  constructor(mod) {
    this.SQL_KEY = {
      API_TOKEN: "api_token",
      API_TOKEN_EXPIRED: "api_token_expired",
      USERNAME: "username"
    };
    this.SQLITE = mod.SQLITE;
  }
  hasTable() {
    return this.SQLITE.hasTable() === true;
  }
  getApiToken() {
    return this.SQLITE.getItem(this.SQL_KEY.API_TOKEN);
  }
  setApiToken(token) {
    return this.SQLITE.setItem(this.SQL_KEY.API_TOKEN, token);
  }
  removeApiToken() {
    this.setApiTokenExpired(0);
    return this.SQLITE.deleteItem(this.SQL_KEY.API_TOKEN);
  }
  getApiTokenExpired() {
    return this.SQLITE.getItem(this.SQL_KEY.API_TOKEN_EXPIRED)?.toInt() || 0;
  }
  setApiTokenExpired(time) {
    if ($.isNumber(time) && time >= 0) {
      return this.SQLITE.setItem(
        this.SQL_KEY.API_TOKEN_EXPIRED,
        time.toString()
      );
    } else {
      $console.error({
        setApiTokenExpired: time,
        message: "time is not number or time<=0"
      });
      return false;
    }
  }
  getUserName() {
    return this.SQLITE.getItem(this.SQL_KEY.USERNAME);
  }
  setUserName(username) {
    return this.SQLITE.setItem(this.SQL_KEY.USERNAME, username);
  }
}
class ExampleModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "tikhub.http",
      name: "TikHub-网络模块",
      version: "1"
      //author: "zhihaofans"
    });
    //this.Mod = mod;
    this.DataCore = new DataCore(mod);
    this.HttpCore = new HttpCore(this);
    this.API_HOST = API_HOST;
  }
  hasTable() {
    return this.DataCore.hasTable();
  }
  getUserName() {
    return this.DataCore.getUserName();
  }
  getApiToken() {
    return this.DataCore.getApiToken();
  }
  setApiToken(apiToken) {
    this.DataCore.setApiToken(apiToken);
  }
  removeApiToken() {
    this.DataCore.removeApiToken();
  }
  get(url, params) {
    return this.HttpCore.get(url, params);
  }
  getThen(url, params) {
    return this.HttpCore.getThen(url, params);
  }
  postThen(url, body, params) {
    return this.HttpCore.postThen(url, body, params);
  }
}
module.exports = ExampleModule;
