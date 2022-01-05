const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(core) {
    this.Core = core;
    this.Kernel = core.kernel;
    this.Http = new core.Http(5);
    this.$ = core.$;
  }
  init() {
    const mainViewList = ["example 1"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.downloadImage();
            break;
          default:
        }
      };

    listKit.pushString(this.Core.MOD_NAME, mainViewList, didSelect);
  }
  downloadImage() {
    this.showDownloadView({
      url:
        "https://images.apple.com/v/ios/what-is/b/images/performance_large.jpg"
    });
  }
  showDownloadView({ url }) {
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
                title: "Default",
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
              const startTime = this.$.time.getUnixTime();
              $http.download({
                url: url,
                showsProgress: true, // Optional, default is true
                backgroundFetch: true, // Optional, default is false
                progress: function (bytesWritten, totalBytes) {
                  const percentage = (bytesWritten * 1.0) / totalBytes;
                  $("progress_download").value = percentage;
                  $console.warn(percentage);
                },
                handler: resp => {
                  //                  $share.sheet(resp.data);
                  $("progress_download").progressColor = $color("#008000");
                  const finishTime = this.$.time.getUnixTime();
                  $console.warn(`下载用了${finishTime - startTime}ms`);
                  $quicklook.open({
                    type: "jpg",
                    data: resp.data
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
  constructor(kernel) {
    super({
      kernel: kernel,
      modName: "下载器",
      version: "1",
      author: "zhihaofans",
      needCoreVersion: 3,
      databaseId: "downloader",
      keychainId: "downloader"
    });
  }
  run() {
    $ui.success("run");
    const main = new Main(this);
    main.init();
  }
}
module.exports = Downloader;
