const ModCore = require("../../Core.js/core").Core,
  $ = require("../../Core.js/$");
class UserData {
  constructor(core) {
    this.Core = core;
    this.Keychain = core.Keychain;
  }
  getTkid() {
    return this.Keychain.get("tkid");
  }
  getToken() {
    return this.Keychain.get("token");
  }
  setTkid(tkid) {
    return this.Keychain.set("tkid", tkid);
  }
  setToken(token) {
    return this.Keychain.set("token", token);
  }
  inputToken() {
    $input.text({
      type: $kbType.text,
      placeholder: "",
      text: "",
      handler: token => {
        if (token.length > 0) {
          $console.info(this.setToken(token));
        }
      }
    });
  }
  inputTkid() {
    $input.text({
      type: $kbType.text,
      placeholder: "",
      text: "",
      handler: tkid => {
        if (tkid.length > 0) {
          $console.info(this.setTkid(tkid));
        }
      }
    });
  }
}

class MefangApi {
  constructor(core) {
    this.Http = $.http;
    this.UserData = new UserData(core);
  }
  getHeader() {
    return {
      "Referer":
        "https://servicewechat.com/wxeee6ace100d9a29a/98/page-frame.html",
      "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x1800122f) NetType/WIFI Language/zh_CN`,
      "token": this.UserData.getToken(),
      "tkid": this.UserData.getTkid()
    };
  }
  async getFightBox({ a, d }) {
    const url = "https://aifendou.net/fightbox",
      header = this.getHeader(),
      body = { a, d },
      resp = await this.Http.post({ url, body, header }),
      response = resp.response,
      data = resp.data;
    $console.info({ data });
    $ui.loading(false);
    if (resp.error) {
      $console.error(resp.error);
      return undefined;
    } else {
      return data;
    }
  }
  async getReservedTimesheet(coachId, dateStart, dateEnd) {
    const result = await this.getFightBox({
      a: "timesheet",
      d: {
        date_start: dateStart || "2022-03-01",
        date_end: dateEnd || "2022-03-07",
        coach_id: coachId || "251"
      }
    });
    $console.info(result);
    return result;
  }
  async getAllTimesheet({ dateStart, dateEnd, coachId }) {
    const result = await this.getFightBox({
      a: "batch/timesheet",
      d: {
        date_start: "2022-03-01",
        date_end: "2022-03-07",
        coach_id: "251"
      }
    });
    $console.info(result);
  }
}

class MefangUi {
  constructor(core) {
    this.Core = core;
    this.Api = new MefangApi(core);
  }
  getCurriculum() {
    const api = new MefangApi(this.Core),
      result = api.getReservedTimesheet();
  }
  init() {
    $console.warn({
      token: this.Api.UserData.getToken(),
      tkid: this.Api.UserData.getTkid()
    });
    const menuList = ["输入token", "输入tkid", "获取课程", "课程二维码"];
    $ui.menu({
      items: menuList,
      handler: (title, idx) => {
        try {
          switch (idx) {
            case 0:
              this.Api.UserData.inputToken();
              break;
            case 1:
              this.Api.UserData.inputTkid();
              break;
            case 2:
              this.getCurriculum();
              break;
          }
        } catch (error) {
          $console.error(error);
        }
      }
    });
  }
}

class Mefang extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "mefang",
      modName: "么方运动",
      version: "1",
      author: "zhihaofans",
      needCoreVersion: 4
    });
    this.ui = new MefangUi(this);
  }
  run() {
    this.ui.init();
  }
}
module.exports = Mefang;
