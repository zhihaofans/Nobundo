const { Core } = require("../../Core.js/core"),
  Next = require("../../Core.js/next");

class ShareAction {
  constructor() {
    this.hasData = this.getData() != undefined;
    this.hasImage = this.getImage() != undefined;
    this.hasLink = this.getLink() != undefined;
    this.hasText = this.getText() != undefined;
  }
  init() {
    if (this.hasImage) {
      $ui.alert({
        title: "发现图片",
        message: "",
        actions: [
          {
            title: "预览",
            disabled: false, // Optional
            handler: () => {
              $quicklook.open({
                image: this.getImage()
              });
            }
          }
        ]
      });
    } else if (this.hasLink) {
      $ui.alert({
        title: "发现链接",
        message: this.getLink(),
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    } else {
      $ui.alert({
        title: "错误",
        message: "不支持该内容",
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {
              $app.close();
            }
          }
        ]
      });
    }
  }
  getData() {
    return $context.data;
  }
  getImage() {
    return $context.image;
  }
  getLink() {
    return $context.link;
  }
  getText() {
    return $context.text;
  }
}

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
  runContext() {
    if (this.isSafari) {
      this.runSafari();
    } else if (this.isShare) {
      this.runShare();
    } else {
      this.run();
    }
  }
  runSafari() {}
  runShare() {
    const shareAction = new ShareAction();
    shareAction.init();
  }
  link(url) {}
}
module.exports = ActionExtension;
