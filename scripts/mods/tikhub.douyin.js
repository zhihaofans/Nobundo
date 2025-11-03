const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  $ = require("$"),
  ListViewKit = new Next.ListView();
class TKDYData {
  constructor(data) {
    this.isError = data == undefined;
    if (data != undefined) {
      try {
        this.title = data.preview_title;
        this.desc = data.desc;
        this.region = data.region; // 国家/地区
        this.author_name = data.author.nickname;
        this.author_id = data.author.short_id;
        this.author_signature = data.author.signature;
        this.author_avatar = data.author.avatar_uri;
      } catch (error) {
        $console.error(error);
        this.isError = true;
      } finally {
      }
    }
  }
}
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
  getVideoByUrl(url) {
    $console.info({
      tikhub: "douyin.getVideoByUrl",
      url
    });
    return new Promise((resolve, reject) => {
      if ($.hasString(url)) {
        const apiUrl =
          this.Http.API_HOST +
          "api/v1/douyin/app/v3/fetch_one_video_by_share_url/";
        this.Http.get(apiUrl, {
          share_url: url
        }).then(
          result => {
            if (result.code == 200 && result.data != undefined) {
              resolve(result);
            } else {
              reject(result);
            }
          },
          fail => reject(fail)
        );
      } else {
        reject("no url");
      }
    });
  }
  getVideoDataById(id) {
    return new Promise((resolve, reject) => {
      if ($.hasString(id)) {
        this.Http.getThen(
          this.Http.API_HOST + "api/v1/douyin/app/v3/fetch_one_video/",
          {
            aweme_id: id
          }
        )
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
class DouyinView {
  constructor() {}
  showResult(tkResult) {
    const DYdata = new TKDYData(result.data);
    $console.info(DYdata);
    $.stopLoading();
    if (tkResult == undefined || DYdata.isError) {
      $ui.alert({
        title: "错误",
        message: "空白结果",
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    } else if (tkResult.code != 200) {
      $ui.alert({
        title: "错误" + tkResult.code,
        message: tkResult.message,
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    } else {
      const result = ["@" + DYdata.author_name];
      $.showView({
        props: {
          title: "douyin:tk"
        },
        views: [
          {
            type: "list",
            props: {
              data: result || ["itemList"]
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
  init() {
    $ui.menu({
      items: ["通过链接", "通过id"],
      handler: (title, idx) => {
        switch (idx) {
          case 0:
            $.inputText("https://v.douyin.com/59vOUVNvoe8/").then(url => {
              if ($.hasString(url)) {
                $.startLoading();
                this.Core.getVideoByUrl(url).then(
                  resu => {
                    new DouyinView().showResult(resu);
                  },
                  fail => {
                    $ui.alert({
                      title: "错误",
                      message: fail,
                      actions: [
                        {
                          title: "OK",
                          disabled: false, // Optional
                          handler: () => {}
                        }
                      ]
                    });
                  }
                );
              } else {
              }
            });
            break;
          default:
        }
      }
    });
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
