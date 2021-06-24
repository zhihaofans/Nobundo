const APP_VERSION = {
    BILI_UNIVERSAl: "62105010",
    COMIC_UNIVERSAl: "802",
    CFNETWORK: "1237",
    DARWIN: "20.4.0",
    OS: "ios",
    MODEL: "iPhone 11",
    OSVER: "14.5",
    BUILD: "62105010",
    NETWORK: "2",
    CHANNEL: "AppStore"
  },
  UA = {
    BILIBILI: `bili-universal/${APP_VERSION.BILI_UNIVERSAl} CFNetwork/${APP_VERSION.CFNETWORK} Darwin/${APP_VERSION.DARWIN} os/${APP_VERSION.OS} model/${APP_VERSION.MODEL} mobi_app/iphone build/${APP_VERSION.BUILD} osVer/${APP_VERSION.OSVER} network/${APP_VERSION.NETWORK} channel/${APP_VERSION.CHANNEL}`
  },
  { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class AutoTask {
  constructor(http, access_key, cookies) {
    this.Http = http;
    this.ACCESSKEY = access_key;
    this.COOKIES = cookies;
  }
  userCheckin() {
    // TODO
  }
  liveCheckin() {
    // TODO
  }
  comicCheckin() {
    // TODO
  }
}
class User {
  constructor(thiscore) {
    this.Core = thiscore;
    this.Kernel = thiscore.kernel;
    this.Http = new thiscore.Http(UA.BILIBILI);
  }
  getAccesskey() {
    return this.Core.getSql("accesskey");
  }
  getCookies() {
    return this.Core.getSql("cookies");
  }
  getUid() {
    return this.Core.getSql("uid");
  }
  setAccesskey(new_accesskey) {
    this.Core.setSql("accesskey", new_accesskey);
  }
  setCookies(new_cookies) {
    this.Core.setSql("cookies", new_cookies);
  }
  setUid(new_uid) {
    this.Core.setSql("uid", new_uid);
  }
  getUserDataByServer() {
    const api_url = "http://api.bilibili.com/x/web-interface/nav",
      httpResult = this.Http.get(api_url, { cookie: this.getCookies() });
    if (httpResult) {
      if (httpResult.error) {
      }
    } else {
    }
  }
  importAccesskey() {
    $input.text({
      type: $kbType.text,
      placeholder: "access key",
      text: this.getAccesskey(),
      handler: function (text) {
        if (text) {
          this.setAccesskey(text);
        } else {
          this.Kernel.error("importAccesskey", "need access key");
        }
      }
    });
  }
  importCookies() {
    $input.text({
      type: $kbType.text,
      placeholder: "cookies",
      text: this.getCookies(),
      handler: function (text) {
        if (text) {
          this.setCookies(text);
        } else {
          this.Kernel.error("importCookies", "need cookies");
        }
      }
    });
  }
  checkLoginStatus() {}
  isLogin() {
    const access_key = this.getAccesskey(),
      cookies = this.getCookies(),
      uid = this.getUid();
    return access_key && cookies && uid;
  }
  login() {
    const $this = this;
    $ui.menu({
      items: ["导入access key", "导入cookie"],
      handler: function (title, idx) {
        switch (idx) {
          case 1:
            $this.importCookies();
            break;
        }
      }
    });
  }
}

class Bilibili extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      mod_name: "哔哩哔哩",
      version: "1",
      author: "zhihaofans",
      need_database: true,
      need_core_version: 1,
      database_id: "bilibili"
    });
    this.User = new User(this);
  }
  init() {
    if (this.User.isLogin()) {
    } else {
      $ui.alert({
        title: "未登录",
        message: "",
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: function () {}
          }
        ]
      });
    }
  }
  mainView() {
    const main_view_list = ["登录"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.User.login();
            break;
        }
      };
    listKit.pushString(this.MOD_NAME, main_view_list, didSelect);
  }
  run() {
    this.mainView();
  }
}
module.exports = Bilibili;
