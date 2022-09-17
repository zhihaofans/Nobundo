const { ModModule } = require("CoreJS"),
  Next = require("Next");

class EmotePackageData {
  constructor({ id, text, url, mtime, type, meta, emote, flags }) {
    this.id = id;
    this.text = text;
    this.url = url;
    this.create_time = mtime;
    this.type = type;
    this.emote = emote.map(item => new EmoteItemData(item)); // Array(EmoteItemData)
    this.size = meta.size;
    this.buy_id = meta.item_id;
    this.buy_url = meta.item_url;
    this.added = flags.added;
  }
}
class EmoteItemData {
  constructor({ id, package_id, text, url, mtime, type, meta, flags }) {
    this.id = id;
    this.package_id = package_id;
    this.text = text;
    this.url = url;
    this.create_time = mtime;
    this.type = type;
    this.no_access = flags.no_access;
    this.size = meta.size;
    this.nickname = meta.alias;
  }
}

class Emote {
  constructor(modModule) {
    this.ModModule = modModule;
  }
  async getEmotePackageInfo(business = "reply", packageId = "93") {
    const cookie = this.ModModule.UserModule.getCookie(),
      url = `http://api.bilibili.com/x/emote/package`,
      resp = await this.ModModule.Http.get({
        url,
        params: {
          business,
          ids: packageId
        },
        header: {
          cookie
        }
      });
    if (resp.error) {
      $console.error(resp.error);
      return undefined;
    } else {
      const result = resp.data;
      if (result.code == 0 && result.data != undefined) {
        const emoteResult = result.data.packages[0];
        $console.info({
          emoteResult
        });
        try {
          const emoteData = new EmotePackageData(emoteResult);
          $console.info({
            emoteData
          });
        } catch (error) {
          $console.error(error);
        }
      } else {
        const { code, message } = result;
        $console.error({
          code,
          message
        });
        return undefined;
      }
    }
  }
}

class BilibiliSocial extends ModModule {
  constructor(mod) {
    super({
      modId: "bilibili",
      moduleId: "bilibili.social",
      moduleName: "哔哩哔哩社交模块",
      version: "1"
    });
    this.Mod = mod;
    this.Emote = new Emote(this);
    this.UserModule = mod.ModuleLoader.getModule("bilibili.user");
    this.Http = new Next.Http(5);
    this.getEmotePackageInfo = this.Emote.getEmotePackageInfo;
  }
  getEmote() {
    this.Emote.getEmotePackageInfo("reply", "93");
  }
  getViewUiList() {
    return [
      {
        title: "获取表情包详情",
        func: this.Emote.getEmotePackageInfo
      }
    ];
  }
}
module.exports = BilibiliSocial;
