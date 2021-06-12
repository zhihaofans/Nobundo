const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class AutoTask {
  constructor(http, access_key, cookies) {
    this.Http = http;
    this.ACCESSKEY = access_key;
    this.COOKIES = cookies;
  }
  userCheckin() {}
  liveCheckin() {}
  comicCheckin() {}
}

class User {
  constructor(core) {
    this.Core = core;
    this.Kernel = core.kernel;
  }
  setAccesskey(new_accesskey) {
    this.Core.setSql("accesskey", new_accesskey);
  }
  setCookies(new_cookies) {
    this.Core.setSql("cookies", new_cookies);
  }
}

class Bilibili extends Core {
  constructor(kernel) {
    super({
      mod_name: "哔哩哔哩",
      version: "1",
      author: "zhihaofans",
      need_database: true,
      need_core_version: 1,
      database_id: "bilibili"
    });
    this.kernel = kernel;
    this.USER = new User(this);
  }
  run() {}
}
module.exports = Bilibili;
