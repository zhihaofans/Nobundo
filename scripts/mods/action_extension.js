const { ModCore } = require("CoreJS"),
  $ = require("$");
class ShareAction {
  constructor() {
    this.hasData = this.getData() != undefined;
    this.hasImage = this.getImage() != undefined;
    this.hasLink = this.getLink() != undefined;
    this.hasText = this.getText() != undefined;
  }
  init() {
    const json = {
      data: this.hasData,
      img: this.hasImage,
      lik: this.hasLink,
      tex: this.hasText
    };
    $ui.alert({
      title: "Hello",
      message: JSON.stringify(json),
      actions: [
        {
          title: "OK",
          disabled: false, // Optional
          handler: () => {}
        },
        {
          title: "Cancel",
          handler: () => {}
        }
      ]
    });
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
          },
          {
            title: "分享",
            disabled: false, // Optional
            handler: () => {
              $share.sheet([this.getImage()]);
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
            title: "复制",
            disabled: false, // Optional
            handler: () => {
              $clipboard.text = this.getLink();
            }
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

class ActionExtension extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "action_extension",
      modName: "分享内容解析",
      version: "3",
      author: "zhihaofans",
      allowContext: true,
      coreVersion: 13,
      iconName: "arrowshape.turn.up.right"
    });
    this.QUERY = $context.query;
  }
  run() {
    $console.info($context.allItems);
    $ui.push({
      props: {
        title: `mode:` + $context.allItems.length
      },
      views: [
        {
          type: "list",
          props: {
            data: ["itemList"]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const { section, row } = indexPath;
            }
          }
        }
      ]
    });
  }
  runContext() {
    if ($.isSafariEnv()) {
      this.runSafari();
    } else if ($.isActionEnv()) {
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
