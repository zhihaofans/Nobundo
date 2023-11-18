const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  $ = require("$"),
  ListViewKit = new Next.ListView();
class DYCore {
  constructor(mod) {
    this.Http = mod.ModuleLoader.getModule("tikhub.http");
  }
  getRealUrl(shortLink) {
    return new Promise((resolve, reject) => {
      if ($.hasString(shortLink)) {
      } else {
        reject();
      }
    });
  }
  getVideoDataById(id) {
    return new Promise((resolve, reject) => {
      if ($.hasString(id)) {
        this.Http.getThen(this.Http.API_HOST + "douyin/video_data/", {
          video_id: id
        })
          .then(resp => {
            $console.info(resp);
            const { statusCode } = resp.response;
            const result = resp.data;

            if (result === undefined) {
              reject({
                success: false,
                httpCode: statusCode,
                code: undefined,
                message: "result=null"
              });
            } else {
              $console.info(statusCode);
              if (
                statusCode === 200 &&
                !$.hasString(result.message) &&
                $.hasArray(result.aweme_list)
              ) {
                const videoList =
                  result.aweme_list[0].video.play_addr ||
                  result.video.download_addr ||
                  result.video.play_addr_265 ||
                  result.video.play_addr_h264;
                resolve({
                  success: !$.hasString(result.message),
                  message: result.message || "",
                  data: result.aweme_list[0],
                  videos: videoList.url_list || []
                });
              } else {
                reject({
                  success: false,
                  httpCode: statusCode,
                  //code: data.code,
                  message: result.message || `Http code:${statusCode}`
                });
              }
            }
          })
          .catch(fail => {
            $console.error(fail);
            reject({
              success: false,
              message: fail.message || "fail"
            });
          });
      } else {
        reject({
          success: false,
          message: "need url"
        });
      }
    });
  }
}

class ExampleModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "tikhub.douyin",
      name: "TikHub-抖音",
      version: "1"
      //author: "zhihaofans"
    });
    //this.Mod = mod;
    this.Core = new DYCore(mod);
  }
  getVideoData() {
    $input.text({
      type: $kbType.text,
      placeholder: "",
      text: "7302260020807208201",
      handler: input => {
        $.startLoading();
        if ($.hasString(input)) {
          this.Core.getVideoDataById(input)
            .then(result => {
              $.stopLoading();
              $console.info(result);
              if (result.success === true) {
                $ui.push({
                  props: {
                    title: `获取成功(${result.videos.length})`
                  },
                  views: [
                    {
                      type: "list",
                      props: {
                        data: result.videos
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
              } else {
                $ui.alert({
                  title: "获取失败",
                  message: result.message,
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
              }
            })
            .catch(fail => {
              $.stopLoading();
              $ui.alert({
                title: "获取失败",
                message: fail.message,
                actions: [
                  {
                    title: "OK",
                    disabled: false, // Optional
                    handler: () => {
                      if (fail.code === 401) {
                        this.loginExpired();
                      }
                    }
                  }
                ]
              });
            });
        } else {
          $ui.error("请输入抖音视频id");
        }
      }
    });
  }
}
module.exports = ExampleModule;
