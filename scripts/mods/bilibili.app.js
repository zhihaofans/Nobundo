const { ModModule } = require("CoreJS"),
  $ = require("$");

class BiliModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.app",
      name: "哔哩哔哩客户端相关",
      version: "1"
    });
  }
  openArticle(kid) {
    if ($.hasString(kid)) {
      $app.openURL(`bilibili://article/${kid}`);
    }
  }
  openBangumi(kid) {
    if ($.hasString(kid)) {
      $app.openURL(`bilibili://bangumi/season/${kid}`);
    }
  }
  openVideo(bvid) {
    if ($.hasString(bvid)) {
      $app.openURL(`bilibili://video/${bvid}`);
    }
  }
  openWebBrowser(url) {
    if ($.hasString(url)) {
      $app.openURL(`bilibili://browser/?url=${$text.URLEncode(url)}`);
    }
  }
}
module.exports = BiliModule;
