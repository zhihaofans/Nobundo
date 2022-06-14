const { Core } = require("../../Core.js/core"),
  ui = require("../../Core.js/ui"),
  listKit = new ui.ListKit();

class ActionExtension extends Core {
  constructor(app) {
    super({
      app,
      modId: "action-extension",
      modName: "分享内容解析",
      version: "1",
      author: "zhihaofans",
      coreVersion: 4
    });
    this.QUERY = $context.query;
    this.isSafari = app.isSafariEnv();
    this.isShare = app.isActionEnv();
  }
  run() {
    $ui.alert({
      title: "启动失败",
      message: "请通过分享打开本Mod",
      actions: [
        {
          title: "OK",
          disabled: false, // Optional
          handler: () => {}
        }
      ]
    });
  }
  runAction() {
    if (this.isSafari) {
      this.runSafari();
    } else if (this.isShare) {
      this.run();
    } else {
      this.run();
    }
  }
  runSafari() {
    const result = { url: [], text: [] },
      safariItems = $context.safari.items;
    result.url.push(
      safariItems.source,
      safariItems.baseURI,
      safariItems.location,
      safariItems.referer
    );
    result.text.push(safariItems.title, safariItems.cookie);
    listKit.renderIdx(
      "内容解析",
      [
        {
          title: "链接",
          rows: result.url
        },
        {
          title: "文本",
          rows: result.text
        }
      ],
      (section, row) => {}
    );
  }
  link(url) {}
}
module.exports = ActionExtension;
