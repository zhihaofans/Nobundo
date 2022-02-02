const APP_VERSION = {
    BILI_UNIVERSAl: "62105010",
    COMIC_UNIVERSAl: "1142",
    CFNETWORK: "1237",
    DARWIN: "20.4.0",
    OS: "ios",
    MODEL: "iPhone 11",
    OSVER: "14.5",
    BUILD: "62105010",
    NETWORK: "2",
    CHANNEL: "AppStore",
    COMIC_VERSION: "4.0.0"
  },
  UA = {
    BILIBILI: `bili-universal/${APP_VERSION.BILI_UNIVERSAl} CFNetwork/${APP_VERSION.CFNETWORK} Darwin/${APP_VERSION.DARWIN} os/${APP_VERSION.OS} model/${APP_VERSION.MODEL} mobi_app/iphone build/${APP_VERSION.BUILD} osVer/${APP_VERSION.OSVER} network/${APP_VERSION.NETWORK} channel/${APP_VERSION.CHANNEL}`,
    COMIC: `Mozilla/5.0 CFNetwork/${APP_VERSION.CFNETWORK} Darwin/${APP_VERSION.DARWIN} os/${APP_VERSION.OS} model/${APP_VERSION.MODEL} mobi_app/iphone build/${APP_VERSION.BUILD} osVer/${APP_VERSION.OSVER} network/${APP_VERSION.NETWORK} channel/${APP_VERSION.CHANNEL} BiliComic/${APP_VERSION.COMIC_UNIVERSAl} VersionName/${APP_VERSION.COMIC_VERSION}`
  },
  { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Http {
  constructor() {
    this.TIMEOUT = 5;
    this.COOKIES = "";
    this.USERAGENT = "";
  }
  setCookies(cookies) {
    this.COOKIES = cookies;
  }
  h_get({ url, cookies, header }) {}
}

class Comic {
  constructor({ core, userdata }) {
    this.core = core;
    this.http = new this.core.Http();
    this.http.setUA(UA.BILIBILI);
    this.http.setCookies(userdata.cookies);
  }
  async getBigVipMonthlyReward() {
    // TODO:每月领取大会员福利券礼包
    $ui.loading(true);
    const apiUrl =
        "https://manga.bilibili.com/twirp/user.v1.User/GetVipReward?device=h5&platform=web",
      referer =
        "https://manga.bilibili.com/eden/membership-rewards.html?flutterReqCode=0&-F.pEncoded=1",
      header = {
        referer
      },
      postBody = {
        type: 0,
        reason_id: 0
      },
      postResult = await this.http.post(apiUrl, postBody, header);
    $ui.loading(false);
    if (postResult.error) {
      this.Core.Kernel.error(postResult.error);
    } else {
      const resultData = postResult.data;
      $ui.alert({
        title: "结果",
        message: JSON.stringify(resultData),
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
}
class UserData {
  constructor(core) {
    this.keychainDomain = "nobundo.mod.bilibili";
    this.Core = core;
    this.Http = new core.Http(5);
    this.cookies = core.getSql("cookies");
    this.uid = core.getSql("uid");
    this.accesskey = core.getSql("accesskey");
  }
  getAccesskey() {
    return this.Core.Keychain.getValue("accesskey");
  }
  setAccesskey(newAccesskey) {
    if (newAccesskey) {
      this.Core.Keychain.setValue("accesskey", newAccesskey);
      this.accesskey = newAccesskey;
    }
  }
  getCookies() {
    return this.Core.Keychain.getValue("cookies");
  }
  setCookies(newCookies) {
    if (newCookies) {
      this.Core.Keychain.setValue("cookies", newCookies);
      this.cookies = newCookies;
      const cookieResult = this.Http.cookieToObj(newCookies);
      this.Http.setCookies(newCookies);
      if (cookieResult.DedeUserID) {
        this.setUid(cookieResult.DedeUserID);
      }
    }
  }
  getUid() {
    return this.Core.Keychain.getValue("uid");
  }
  setUid(newUid) {
    if (newUid) {
      this.Core.Keychain.setValue("uid", newUid);
      this.uid = newUid;
    }
  }
}

class User {
  constructor(core) {
    this.Core = core;
    this.Kernel = core.kernel;
    this.Data = new UserData(core);
    this.Http = new core.Http();
    this.Http.setUA(UA.BILIBILI);
    this.Http.setCookies(this.Data.cookies);
  }
  async getUserDataByServer() {
    $ui.loading(true);
    const api_url = "http://api.bilibili.com/x/web-interface/nav",
      header = {
        "User-Agent": UA.BILIBILI,
        "cookie": this.Data.getCookies()
      },
      httpResult = await this.Http.get(api_url, header);
    $console.info(httpResult);
    $ui.loading(false);
    if (httpResult && !httpResult.error) {
      return httpResult.data();
    }
    return undefined;
  }
  importAccesskey() {
    $input.text({
      type: $kbType.text,
      placeholder: "access key",
      text: this.Data.accesskey,
      handler: input => {
        if (input) {
          this.Data.setAccesskey(input);
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
      text: this.Data.cookies,
      handler: input => {
        if (input) {
          this.Data.setCookies(input);
        } else {
          this.Kernel.error("importCookies", "need cookies");
        }
      }
    });
  }
  checkLoginStatus() {}
  isLogin() {
    return (
      this.Data.getAccesskey() && this.Data.getCookies() && this.Data.getUid()
    );
  }
  login() {
    $ui.menu({
      items: ["导入access key", "导入cookies"],
      handler: (title, idx) => {
        switch (idx) {
          case 0:
            this.importAccesskey();
            break;
          case 1:
            this.importCookies();
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
      modName: "哔哩哔哩",
      version: "2",
      author: "zhihaofans",
      needCoreVersion: 3,
      databaseId: "bilibili",
      keychainId: "bilibili"
    });
    this.User = new User(this);
    this.Comic = new Comic({
      core: this,
      userdata: new UserData(this)
    });
  }
  init() {
    if (this.User.isLogin()) {
      this.Kernel.info("bilibili.user", "login");
      this.loggedView();
    } else {
      $ui.alert({
        title: "未登录",
        message: "",
        actions: [
          {
            title: "登录",
            disabled: false, // Optional
            handler: () => {
              this.User.login();
            }
          },
          {
            title: "取消"
          }
        ]
      });
    }
  }
  loggedView() {
    const main_view_list = ["获取个人信息", "领取每月漫画券"],
      didSelect = (section, row) => {
        switch (row) {
          case 0:
            this.User.getUserDataByServer();
            break;
          case 1:
            this.Comic.getBigVipMonthlyReward();
        }
      };
    listKit.pushIdx(this.MOD_NAME, main_view_list, didSelect);
  }
  mainView() {
    const main_view_list = ["获取个人信息"],
      didSelect = (section, row) => {
        switch (row) {
          case 0:
            this.User.getUserDataByServer();
            break;
        }
      };
    listKit.pushIdx(this.MOD_NAME, main_view_list, didSelect);
  }
  run() {
    try {
      this.init();
    } catch (error) {
      this.Kernel.error("bilibili", error.message);
    }
  }
}
module.exports = Bilibili;
