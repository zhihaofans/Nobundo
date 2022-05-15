const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(core) {
    this.Core = core;
    this.$ = core.$;
    this.Http = core.$.http;
    this.isShare = this.$.share.isAction();
  }
  init() {
    const mainViewList = ["开始下载"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.inputUrl();
            break;
        }
      };
    listKit.pushString(this.Core.MOD_NAME, mainViewList, didSelect);
    if (this.isShare) {
      this.loadShare();
    }
  }
  loadShare() {
    const shareUrl = this.$.share.getLink(),
      shareText = this.$.share.getText(),
      linkList = $detector.link(shareUrl).concat($detector.link(shareText));
    if (linkList.length >= 0) {
      $ui.alert({
        title: "分享了链接",
        message: "是否解析",
        actions: [
          {
            title: "是",
            disabled: false, // Optional
            handler: () => {
              this.checkUrl(linkList[0]);
            }
          },
          {
            title: "否"
          }
        ]
      });
    }
  }
  inputUrl() {
    $input.text({
      type: $kbType.text,
      placeholder: "请输入链接",
      text: "",
      handler: input => {
        if (input.length > 0) {
          const links = $detector.link(input);
          if (links.length > 0) {
            const url = links[0];
            $console.warn(url);
            $ui.alert({
              title: "自动检测链接类型吗",
              message: "",
              actions: [
                {
                  title: "检测",
                  disabled: false, // Optional
                  handler: () => {
                    this.checkUrl(url);
                  }
                },
                {
                  title: "手动",
                  disabled: true, // Optional
                  handler: () => {}
                },
                {
                  title: "取消",
                  disabled: false, // Optional
                  handler: () => {}
                }
              ]
            });
          } else {
            $ui.error("找不到链接");
          }
        } else {
          $ui.error("请输入链接");
        }
      }
    });
  }
  async checkUrl(url) {
    $console.info({
      url
    });
    $ui.loading(true);
    const startQueryTime = 0,
      headResult = await this.Http.head({
        url
      }),
      resp = headResult.response;
    $ui.loading(false);
    if (resp.statusCode == 200) {
      const mimeType = resp.MIMEType.toLowerCase(),
        suggestedFilename = resp.suggestedFilename;
      switch (true) {
        case mimeType.startsWith("image/"):
          this.showDownloadView({
            url,
            mimeType,
            fileName: suggestedFilename
          });
          break;
        default:
          $ui.alert({
            title: "检测不到支持的格式",
            message: mimeType,
            actions: [
              {
                title: "手动",
                disabled: true, // Optional
                handler: () => {}
              },
              {
                title: "取消"
              }
            ]
          });
      }
    } else {
      $ui.error("错误代码");
    }
  }
  showDownloadView({ url, mimeType, fileName }) {
    const imageMimetypeList = {
        "image/gif": "gif",
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/bmp": "bmp",
        "image/webp": "webp"
      },
      hasType = Object.keys(imageMimetypeList).indexOf(mimeType) >= 0,
      imageType = hasType ? imageMimetypeList[mimeType] : "jpg";
    $ui.push({
      props: {
        title: ""
      },
      views: [
        {
          type: "list",
          props: {
            data: [
              {
                title: "下载进度",
                rows: [
                  {
                    type: "progress",
                    props: {
                      id: "progress_download",
                      value: 0
                    },
                    layout: (make, view) => {
                      make.centerY.equalTo(view.super);
                      make.left.right.inset(20);
                    }
                  },
                  {
                    type: "label",
                    props: {
                      id: "label_download",
                      text: "0.00%",
                      align: $align.center,
                      autoFontSize: true
                    },
                    layout: (make, view) => {
                      make.center.equalTo(view.super);
                    }
                  },
                  {
                    type: "button",
                    props: {
                      id: "button_share",
                      title: "预览",
                      hidden: true,
                      icon: $icon("023", $color("white"), $size(20, 20))
                    },
                    layout: (make, view) => {
                      make.center.equalTo(view.super);
                      make.size.equalTo($size(100, 40));
                    }
                  }
                ]
              }
            ]
          },
          layout: $layout.fill,
          events: {
            didSelect: (_sender, indexPath, _data) => {
              const section = indexPath.section;
              const row = indexPath.row;
            },
            ready: sender => {
              const startTime = this.$.dateTime.getUnixTime();
              $http.download({
                url: url,
                showsProgress: true, // Optional, default is true
                backgroundFetch: true, // Optional, default is false
                progress: (bytesWritten, totalBytes) => {
                  const percentage = (bytesWritten * 1.0) / totalBytes;
                  $ui.get("progress_download").value = percentage;
                  $ui.get("label_download").text = `${Math.round(
                    percentage * 100
                  )}%`;
                  $console.warn(percentage);
                },
                handler: resp => {
                  const finishDownloadTime = this.$.dateTime.getUnixTime();
                  $ui.get("progress_download").progressColor = $color(
                    "#008000"
                  );
                  $console.warn(
                    `下载用了${finishDownloadTime - startTime}毫秒`
                  );
                  $ui.get("button_share").hidden = false;
                  $quicklook.open({
                    type: imageType,
                    data: resp.data
                  });
                  $ui.get("button_share").whenTapped(() => {
                    $quicklook.open({
                      type: imageType,
                      data: resp.data
                    });
                  });
                }
              });
            }
          }
        }
      ]
    });
  }
}

class Downloader extends Core {
  constructor(app) {
    super({
      app,
      modId: "downloader",
      modName: "下载器",
      version: "1a",
      author: "zhihaofans",
      coreVersion: 5
    });
    this.main = new Main(this);
  }
  run() {
    $ui.success("run");
    this.main.init();
  }
  runApi(id, data) {
    $console.info({
      func: "downloader.runApi",
      id,
      data
    });
    switch (id) {
      case "start_downloading":
        this.main.checkUrl(data.url);
        //return true;
        break;
      default:
        return undefined;
    }
  }
}
module.exports = Downloader;
