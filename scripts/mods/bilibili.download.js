const { ModModule } = require("CoreJS"),
  $ = require("$"),
  HttpLib = require("HttpLib");

class VideoInfoView {
  constructor(ModuleLoader) {
    this.ModuleLoader = ModuleLoader;
    this.Auth = ModuleLoader.getModule("bilibili.auth");
  }
  getDownloadData(bvid, cid) {
    return new Promise((resolve, reject) => {
      const url = `https://api.bilibili.com/x/player/playurl`,
        params = {
          bvid,
          cid,
          fnval: 4048,
          qn: 127,
          fnver: 0,
          fourk: 1
        };
      try {
        $console.info("trystart");
        new HttpLib(url, params)
          .header({
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Referer": "https://www.bilibili.com",
            "Cookie": this.Auth.getCookie()
          })
          .get()
          .then(
            resp => {
              if (resp.isError) {
                reject(resp.errorMessage);
              } else {
                resolve(resp.data);
              }
            },
            fail => reject(fail)
          );
        $console.info("try");
      } catch (error) {
        $console.error(error);
        reject(error);
      }
    });
  }
  showDownloadView(bvid, cid) {
    const resultView = [
      {
        type: "label",
        props: {
          text: "视频链接",
          font: $font(14),
          textColor: $color("#333")
        },
        layout: (make, view) => {
          make.top.inset(15);
          make.left.right.inset(15);
        }
      },
      {
        type: "input",
        props: {
          placeholder: "请输入视频下载链接",
          font: $font(14),
          bgcolor: $color("#f5f5f5"),
          radius: 6,
          id: "videoInput"
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(8);
          make.left.right.inset(15);
          make.height.equalTo(36);
        }
      },
      {
        type: "button",
        props: {
          title: "下载视频",
          bgcolor: $color("#00a1d6"),
          titleColor: $color("white"),
          radius: 6
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(10);
          make.left.right.inset(15);
          make.height.equalTo(40);
        },
        events: {
          tapped: sender => {
            const url = $("videoInput").text;
            if (!url) {
              $ui.toast("请输入视频链接");
              return;
            }
            $console.info("视频链接:", url);
           
          }
        }
      },
      {
        type: "label",
        props: {
          text: "音频链接",
          font: $font(14),
          textColor: $color("#333")
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(20);
          make.left.right.inset(15);
        }
      },
      {
        type: "input",
        props: {
          placeholder: "请输入音频下载链接",
          font: $font(14),
          bgcolor: $color("#f5f5f5"),
          radius: 6,
          id: "audioInput"
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(8);
          make.left.right.inset(15);
          make.height.equalTo(36);
        }
      },
      {
        type: "button",
        props: {
          title: "下载音频",
          bgcolor: $color("#4caf50"),
          titleColor: $color("white"),
          radius: 6
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(10);
          make.left.right.inset(15);
          make.height.equalTo(40);
        },
        events: {
          tapped: sender => {
            const url = $("audioInput").text;
            if (!url) {
              $ui.toast("请输入音频链接");
              return;
            }
            $console.info("音频链接:", url);
            
          }
        }
      }
    ];
    $ui.push({
      props: {
        title: `${bvid}:${cid}`
      },
      views: [
        {
          type: "view",
          props: {
            id: "viewResult"
          },
          layout: $layout.fillSafeArea, //(make, view) => {},
          views: resultView,
          
          events: {
            ready: () => {
              $.startLoading();
              this.getDownloadData(bvid, cid)
                .then(resu => {
                  $.stopLoading();
                  $console.warn(resu);
                  $ui.get("videoInput").
                })
                .catch(fail => {
                  $.stopLoading();
                  $console.error(fail);
                  $ui.alert({
                    title: "err",
                    message: fail,
                    actions: [
                      {
                        title: "OK",
                        disabled: false, // Optional
                        handler: () => {
                  
                        }
                      },
                      {
                        title: "Cancel",
                        handler: () => {
                  
                        }
                      }
                    ]
                  })
                });
            }
          }
        }
      ]
    });
  }
  init(videoInfo) {
    if (videoInfo == undefined) {
      $ui.alert({
        title: "空白bvid",
        message: "",
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    } else {
      const pList = videoInfo.pages;
      $ui.push({
        props: {
          title: `${videoInfo.bvid}(${videoInfo.pages.length}P)`
        },
        views: [
          {
            type: "list",
            props: {
              autoRowHeight: true,
              estimatedRowHeight: 44,
              data: pList.map(p => `${p.cid}|${p.part}|${p.duration}s`)
            },
            layout: $layout.fill,
            events: {
              didSelect: (sender, indexPath, data) => {
                this.showDownloadView(videoInfo.bvid, pList[indexPath.row].cid);
              }
            }
          }
        ]
      });
    }
  }
}
class ExampleModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.download",
      name: "哔哩下载",
      version: "1"
    });
    this.ModuleLoader = mod.ModuleLoader;
  }
  getVideoInfo(videoInfo) {
    new VideoInfoView(this.ModuleLoader).init(videoInfo);
  }
}
module.exports = ExampleModule;
