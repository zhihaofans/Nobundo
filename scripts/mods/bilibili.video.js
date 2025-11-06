const { ModModule } = require("CoreJS"),
  $ = require("$"),
  HttpLib = require("HttpLib");
class VideoCore {
  constructor(mod) {
    this.Auth = mod.ModuleLoader.getModule("bilibili.auth");
  }
  getVideoInfo(videoId) {
    return new Promise((resolve, reject) => {
      if (!$.hasString(videoId)) {
        reject("video id");
      } else {
        const url = `https://api.bilibili.com/x/web-interface/view`;
        new HttpLib(url)
          .cookie(this.Auth.getCookie())
          .params({
            bvid: videoId
          })
          .get()
          .then(
            resp => {
              $console.info(resp);
              if (resp.isError) {
                reject(resp.errorMessage);
              } else {
                const result = resp.data;
                if (result.code == 0 && result.data != undefined) {
                  resolve(result.data);
                } else {
                  reject(result.message || `code ${result.code}`);
                }
              }
            },
            fail => reject(fail)
          );
      }
    });
  }
}
class VideoView {
  constructor(mod) {
    this.Core = new VideoCore(mod);
    this.Template = mod.ModuleLoader.getModule("bilibili.template");
    this.ApiManager = mod.ApiManager;
  }
  showVideoInfo(videoId) {
    if ($.hasString(videoId)) {
      $.startLoading();
      this.Core.getVideoInfo(videoId).then(
        videoInfo => {
          $.stopLoading();
          $ui.push({
            props: {
              title: "video"
            },
            views: [
              this.Template.imageTemplate({
                id: "imageCover",
                src: videoInfo.pic + "@1q.webp",
                layout: (make, view) => {
                  make.left.top.right.inset(10);
                  make.width.equalTo(view.width);
                  make.height.equalTo(200);
                },
                tapped: sender => {
                  $console.info(videoInfo.pic);
                  //TODO:修复api调用
                  this.ApiManager.runApi({
                    apiId: "zhihaofans.viewer.open.image",
                    data: { images: [videoInfo.pic] },
                    callback: index => {}
                  });
                }
              }),
              this.Template.labelTemplate({
                id: "labelUserName",
                text: `@${videoInfo.owner.name}`,
                layout: (make, view) => {
                  make.left.right.inset(10);
                  make.top.greaterThanOrEqualTo(220);
                  //make.width.equalTo(view.width);
                  make.height.equalTo(30);
                },
                tapped: sender => {
                  $console.info(sender.text);
                }
              }),
              this.Template.labelTemplate({
                id: "labelVideoTitle",
                text: videoInfo.title,
                lines: 0,
                layout: (make, view) => {
                  make.left.right.inset(10);
                  make.top.greaterThanOrEqualTo(
                    $ui.get("labelUserName").bottom
                  );
                  //make.width.equalTo(view.width);
                  make.height.equalTo(30);
                },
                tapped: sender => {
                  $console.info(sender.text);
                }
              }),
              this.Template.buttonTemplate({
                id: "buttonDownload",

                title: "下载视频",
                layout: (make, view) => {
                  make.top.greaterThanOrEqualTo(
                    $ui.get("labelVideoTitle").bottom
                  );
                  make.centerX.equalTo(view.super);
                },
                tapped: () => {
                  //this.Downloader.startDownload(videoInfo);
                }
              })
            ]
          });
        },
        fail => {
          $.stopLoading();
          $ui.error(fail);
        }
      );
    } else {
      $ui.error("video id");
    }
  }
}
class BiliModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.video",
      name: "哔哩哔哩视频",
      version: "1"
    });
    this.View = new VideoView(mod);
  }
  getVideoInfo(videoId) {
    this.View.showVideoInfo(videoId);
  }
}
module.exports = BiliModule;
