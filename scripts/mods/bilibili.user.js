const { CoreModule } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class UserData {
  constructor(keychain) {
    this.Keychain = keychain;
  }
  cookie(cookieStr) {
    const keychainId = "user.login.cookies";
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
  getCookies() {
    return this.Login.Data.cookie();
  }
}
module.exports = BilibiliUser;
