const { ModCore, ModuleLoader } = require("CoreJS"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class BilibiliLauncher {
  constructor(name) {
    this.NAME = name;
  }
  app(mode, id) {
    $app.openURL(`bilibili://${mode}/${id}`);
  }
  video(vid) {
    this.app("video", vid);
  }
  getVideoUrl(vid) {
    return `bilibili://video/${vid}`;
  }
  live(roomid) {
    this.app("live", roomid);
  }
  space(uid) {
    this.app("space", uid);
  }
  article(id) {
    this.app("article", id);
  }
  dynamic(id) {
    this.app("following/detail", id);
  }
}

class BilibiliApi {
  constructor(mod) {
    this.Mod = mod;
    this.$ = mod.$;
    this.Http = mod.Http;
  }
  getAppsecByAppkey(appkey) {
    const keyAndSec = {
      "07da50c9a0bf829f": "25bdede4e1581c836cab73a48790ca6e",
      "1d8b6e7d45233436": "560c52ccd288fed045859ed18bffd973",
      "178cf125136ca8ea": "34381a26236dd1171185c0beb042e1c6",
      "27eb53fc9058f8c3": "c2ed53a74eeefe3cf99fbd01d8c9c375",
      "37207f2beaebf8d7": "e988e794d4d4b6dd43bc0e89d6e90c43",
      "4409e2ce8ffd12b8": "59b43e04ad6965f34319062b478f83dd",
      "57263273bc6b67f6": "a0488e488d1567960d3a765e8d129f90",
      "7d336ec01856996b": "a1ce6983bc89e20a36c37f40c4f1a0dd",
      "85eb6835b0a1034e": "2ad42749773c441109bdc0191257a664",
      "8e16697a1b4f8121": "f5dd03b752426f2e623d7badb28d190a",
      "aae92bc66f3edfab": "af125a0d5279fd576c1b4418a3e8276d",
      "ae57252b0c09105d": "c75875c596a69eb55bd119e74b07cfe3",
      "bb3101000e232e27": "36efcfed79309338ced0380abd824ac1",
      "bca7e84c2d947ac6": "60698ba2f68e01ce44738920a0ffe768",
      "iVGUTjsxvpLeuDCf": "aHRmhWMLkdeMuILqORnYZocwMBpMEOdt",
      "YvirImLGlLANCLvM": "JNlZNgfNGKZEpaDTkCdPQVXntXhuiJEM"
    };
    return keyAndSec[appkey];
  }
  getSign(params, appkey, appSec) {
    let paramsStr = "";
    Object.keys(params).map(param => {
      if (paramsStr.length == 0) {
        paramsStr = `${param}=${params[param]}`;
      } else {
        paramsStr += `&${param}=${params[param]}`;
      }
    });
    const sign = $text.URLEncode($text.URLEncode(paramsStr) + appSec);
    $console.info(sign);
    return $text.MD5(sign);
  }
  async getUserInfo(cookie) {
    const url = "https://api.bilibili.com/x/web-interface/nav",
      header = { cookie },
      timeout = 5,
      result = await this.Http.get({
        url,
        header,
        timeout
      });
    $console.info({ result });
    return result.data;
  }
}

class Main {
  constructor(mod) {
    this.Mod = mod;
    this.Video = this.Mod.ModuleLoader.getModule("bilibili.video");
    this.UserModule = this.Mod.ModuleLoader.getModule("bilibili.user");
    this.Vip = this.UserModule.Vip;
    this.isLoading = false;
  }
  init() {
    const mainViewList = [
        "扫描二维码登录",
        "查看登录数据",
        "查看用户信息",
        "查看大会员特权",
        "稍后再看",
        "历史记录"
      ],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.UserModule.login(sender.cell(indexPath));
            break;
          case 1:
            $ui.alert({
              title: "Cookie",
              message: this.UserModule.getCookie(),
              actions: [
                {
                  title: "OK",
                  disabled: false, // Optional
                  handler: () => {}
                }
              ]
            });
            break;
          case 3:
            try {
              this.Vip.getPrivilegeStatus(sender.cell(indexPath));
            } catch (error) {
              $console.error(error);
            }
            break;
          case 4:
            this.UserModule.Info.getLaterToWatch();
            break;
          case 5:
            this.UserModule.Info.getHistory();
            break;
        }
      };
    listKit.pushString(this.Mod.MOD_INFO.NAME, mainViewList, didSelect);
  }
}

class Bilibili extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "bilibili",
      modName: "哔哩哔哩",
      version: "5c",
      author: "zhihaofans",
      coreVersion: 8
    });
    this.$ = app.$;
    this.Http = app.$.http;
    this.Storage = app.Storage;
    this.ModuleLoader = new ModuleLoader(this);
    this.biliLauncher = new BilibiliLauncher();
  }
  run() {
    this.ModuleLoader.addModule("bilibili.video.js");
    this.ModuleLoader.addModule("bilibili.user.js");
    const main = new Main(this);
    main.init();
  }
}
module.exports = Bilibili;
