const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  HttpLib = require("HttpLib"),
  $ = require("$");

class AuthData {
  constructor() {}
}
class QrcodeLogin {
  constructor() {}
  isLogin() {}
  getWebKey() {
    return new Promise((resolve, reject) => {
      const url =
        "https://passport.bilibili.com/x/passport-login/web/qrcode/generate";
      new HttpLib(url).get().then(resp => {
        if (resp.isError != false) {
          reject(resp.errorMessage || "未知错误");
        } else {
          const result = resp.data;
          if (result.code === 0 && $.hasString(result.data.qrcode_key)) {
            resolve(result.data.qrcode_key);
          } else {
            reject(result.message || "未知错误");
          }
        }
      });
    });
  }
}
class BiliModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.auth",
      name: "哔哩哔哩认证",
      version: "1"
    });
  }
  checkLogin() {}
}
module.exports = BiliModule;
