const { ModModule } = require("CoreJS"),
  Next = require("Next");
class Emote {
  constructor(modModule) {
    this.ModModule = modModule;
  }
  getEmotePackage(business, packageId) {
    const cookie = this.Module.Mod.ModuleLoader.getModule(
        "bilibili.user"
      ).getCookie(),
      url = `http://api.bilibili.com/x/emote/package?business=${business}&ids=${packageId}`;
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
  }
  getEmote() {}
}
module.exports = BilibiliSocial;
