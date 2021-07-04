const __VERSION__ = 1,
  default_data = require("./default");
class Http {
  constructor(timeout) {
    this.TIMEOUT = timeout ?? 5;
    this.USER_AGENT = default_data.http.user_agent;
    this.COOKIES = "";
  }
  setCookies(cookies) {
    this.COOKIES = cookies;
  }
  setUA(ua) {
    this.USER_AGENT = ua;
  }
  async get(url, header) {
    const new_header = header ?? {};
    header["User-Agent"] = this.USER_AGENT;
    if (this.COOKIES) {
      header["cookie"] = this.COOKIES;
    }
    const result = await $http.get({
      url: url,
      timeout: this.TIMEOUT,
      header: new_header
    });
    return url ? result : undefined;
  }
  async post(url, postBody, header) {
    const new_header = header ?? {};
    header["User-Agent"] = this.USER_AGENT;
    if (this.COOKIES) {
      header["cookie"] = this.COOKIES;
    }
    const result = await $http.post({
      url: url,
      header: new_header,
      timeout: this.TIMEOUT,
      body: postBody
    });
    return url ? result : undefined;
  }
  download(url, handler, progress) {
    const header = { "User-Agent": this.USER_AGENT, cookie: this.COOKIES };
    $http.download({
      url: url,
      header: header,
      showsProgress: true, // Optional, default is true
      backgroundFetch: true, // Optional, default is false
      progress: progress,
      handler: handler
    });
  }
  cookieToObj(cookie) {
    if (cookie) {
      const cookie_result = {};
      cookie.split(";").map(cookie_item => {
        const item_split = cookie_item.trim().split("="),
          item_key = item_split[0],
          item_valve = item_split[1];

        cookie_result[item_key] = item_valve;
      });
      return cookie_result;
    } else {
      return undefined;
    }
  }
}
module.exports = { __VERSION__, Http };
