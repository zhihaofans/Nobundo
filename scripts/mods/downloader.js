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
    const mainViewList = ["example 1", "下载"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.downloadImage();
            break;
          case 1:
            this.inputUrl();
            break;
          default:
        }
      };

    listKit.pushString(this.Core.MOD_NAME, mainViewList, didSelect);
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
    const headResult = await this.$.http.head({
        url
      }),
      resp = headResult.response;
    if (resp.statusCode == 200) {
      const MIMEType = resp.MIMEType.toLowerCase(),
        suggestedFilename = resp.suggestedFilename;
      switch (true) {
        case MIMEType.startsWith("image/"):
          this.showDownloadView({
            url
          });
          break;
        default:
          $ui.alert({
            title: "检测不到支持的格式",
            message: MIMEType,
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
