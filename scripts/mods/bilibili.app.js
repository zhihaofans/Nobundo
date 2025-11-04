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
  openWebBrowser(url) {
    if ($.hasString(url)) {
      $app.openURL(`bilibili://browser/?url=${$text.URLEncode(url)}`);
    }
  }
}
module.exports = BiliModule;
