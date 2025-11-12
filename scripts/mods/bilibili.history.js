const { ModModule } = require("CoreJS"),
  $ = require("$"),
  HttpLib = require("HttpLib");
class PublishItemData {
  constructor(videoData) {
    this.author_face = videoData.owner?.face || videoData.author_face;
    this.author_mid = videoData.owner?.mid || videoData.author_mid;
    this.author_name = videoData.owner?.name || videoData.author_name;
    this.avid = videoData.aid || videoData.history?.avid;
    this.business = videoData.history?.business || "archive"; //历史类型：archive：稿件，pgc：剧集（番剧 / 影视），live：直播，article-list：文集，article：文章
    switch (this.business) {
      case "live":
        this.badge = "直播";
        break;
      case "archive":
        this.badge = "视频";
        break;
      case "pgc":
        this.badge = "番剧 / 影视";
        break;
      // 专栏/文章自带该属性
      //      case "article":
      //        this.badge = "文章";
      //        break;
      case "article-list":
        this.badge = "文集";
        break;
      default:
        this.badge = videoData.badge;
    }
    this.bvid = videoData.bvid || videoData.history?.bvid;
    this.copyright = videoData.copyright; //1：原创 2：转载
    this.cover_image = videoData.pic || videoData.cover || videoData.covers[0]; //视频封面
    this.desc = videoData.desc; //简介
    this.kid = videoData.kid;
    this.parts_count = videoData.videos; //稿件分P总数
    this.progress = videoData.progress; //视频观看进度(秒)
    if (this.progress < 0) this.progress = 0;
    this.duration = videoData.duration; //视频总长度(秒)
    this.view_percentage =
      this.duration === 0
        ? 0
        : ((this.progress * 100) / this.duration).toFixed(2);
    this.publish_location = videoData.pub_location; //发布定位
    this.publish_time = videoData.pubdate; //发布时间
    this.short_link = videoData.short_link_v2 || videoData.short_link;
    this.staff = videoData.staff; //合作成员列表
    this.show_title = videoData.show_title;
    this.tid = videoData.tid; //分区id
    this.title = videoData.title;
    this.tname = videoData.tname; //子分区名称
    this.upload_time = videoData.ctime; //投稿时间戳
    this.uri = videoData.uri;
  }
}
class HistoryCore {
  constructor(auth) {
    this.Auth = auth;
  }
  getList(pageSize = 30) {
    return new Promise((resolve, reject) => {
      const url = `https://api.bilibili.com/x/web-interface/history/cursor?ps=${pageSize}`;
      try {
        $console.info("trystart");
        new HttpLib(url)
          .cookie(this.Auth.getCookie())
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
}
class LaterWatchCore {
  constructor(auth) {
    this.Auth = auth;
  }
  addItem(bvid) {
    return new Promise((resolve, reject) => {
      try {
        const url = "https://api.bilibili.com/x/v2/history/toview/add";
        $console.info("trystart");
        $console.info({
          auth: this.Auth,
          bvid
        });
        new HttpLib(url)
          .cookie(this.Auth.getCookie())
          .header({
            "Content-Type": "application/x-www-form-urlencoded"
          })
          .post({
            bvid,
            csrf: this.Auth.getCsrf()
          })
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
  getList() {
    return new Promise((resolve, reject) => {
      const url = "https://api.bilibili.com/x/v2/history/toview";
      try {
        $console.info("trystart");
        new HttpLib(url)
          .cookie(this.Auth.getCookie())
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
}
class View {
  constructor(mod) {
    this.Auth = mod.ModuleLoader.getModule("bilibili.auth");
    this.Template = mod.ModuleLoader.getModule("bilibili.template");
    this.Video = mod.ModuleLoader.getModule("bilibili.video");
    this.App = mod.ModuleLoader.getModule("bilibili.app");
  }
  addLaterToWatch(bvid) {
    if ($.hasString(bvid)) {
      $.startLoading();
      new LaterWatchCore(this.Auth).addItem(bvid).then(
        result => {
          $console.info(result);
          $.stopLoading();
          if (result.code == 0) {
            $ui.success(`code ${result.code}:${result.message}`);
          } else {
            $ui.error(`code ${result.code}:${result.message}`);
          }
        },
        fail => {
          $.stopLoading();
          $ui.error(fail);
        }
      );
    } else {
      $ui.error("空白vid");
    }
  }
  showResultList(title, videoList, isHistory = false) {
    $.stopLoading();
    const itemList = videoList.map(thisVideo => {
        //      $console.info({
        //        thisVideo
        //      });
        let authorTitle = "",
          viewProgress = ` (已看${thisVideo.view_percentage}%)`;
        if (thisVideo.progress === 0) {
          viewProgress = " (未看)";
        }
        switch (thisVideo.business) {
          case "pgc":
            authorTitle = thisVideo.show_title;
            break;
          case "archive":
            authorTitle = thisVideo.author_name;
            break;
          default:
            authorTitle = thisVideo.author_name;
        }
        if (thisVideo.badge) {
          authorTitle += `[${thisVideo.badge}]`;
        }
        return {
          labelTitle: {
            text: thisVideo.title
          },
          labelAuthor: {
            text: authorTitle
          },
          imageCover: {
            src: thisVideo.cover_image + "@1q.webp"
          },
          imageFace: {
            src: thisVideo.author_face + "@1q.webp"
          },
          labelTime: {
            text: viewProgress
          }
        };
      }),
      didSelect = (section, row) => {
        const videoItem = videoList[row];
        $console.info({
          videoItem
        });
        if (isHistory === true) {
          switch (videoItem.business) {
            case "pgc":
              this.App.openBangumi(videoItem.kid);
              break;
            case "article":
              this.App.openArticle(videoItem.kid);
              break;
            case "live":
              $console.info(videoItem);
              $app.openURL(videoItem.uri);
              break;
            default:
              this.App.openVideo(videoItem.bvid);
          }
        } else {
          this.App.openVideo(videoItem.bvid);
        }
      };
    const later2watchNavMenu = [
      {
        title: "菜单",
        symbol: "command", // SF symbols are supported
        handler: sender => {
          $ui.alert("Tapped!");
        },
        menu: {
          title: "长按菜单",
          items: [
            {
              title: "移除看完视频",
              handler: sender => {}
            }
          ]
        } // Pull-Down menu
      }
    ];
    $ui.push({
      props: {
        title,
        navButtons: isHistory !== true ? later2watchNavMenu : undefined
      },
      views: [
        {
          type: "matrix",
          props: {
            id: "postList",
            columns: 1,
            itemHeight: 320, //每行高度
            square: false,
            spacing: 2, //间隔
            template: this.Template.singlePostTemplate(),
            data: itemList,
            header: {
              type: "label",
              props: {
                height: 20,
                text: `共${videoList.length || 0}个稿件`,
                textColor: $color("#AAAAAA"),
                align: $align.center,
                font: $font(12)
              }
            },
            footer: {
              type: "label",
              props: {
                height: 20,
                text: "温馨提示:长按有个菜单",
                textColor: $color("#AAAAAA"),
                align: $align.center,
                font: $font(12)
              }
            }
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) =>
              didSelect(indexPath.section, indexPath.row),
            didLongPress: (sender, indexPath, data) => {
              $console.info(indexPath);
              const selectItem = videoList[indexPath.row];
              $ui.menu({
                items: ["获取封面", "获取信息", "一键投币"],
                handler: (title, idx) => {
                  switch (idx) {
                    case 0:
                      $ui.preview({
                        title: "稿件封面图",
                        url: selectItem.cover_image
                      });
                      break;
                    case 1:
                      if (selectItem.business === "archive") {
                        this.Video.getVideoInfo(selectItem.bvid);
                      } else {
                        $ui.warning("开发中");
                      }
                      break;
                    default:
                      $ui.error("?!");
                  }
                }
              });
            }
          }
        }
      ]
    });
  }
  showHistory() {
    $.startLoading();
    new HistoryCore(this.Auth).getList().then(
      result => {
        if (result.code == 0) {
          try {
            const list = result.data.list;
            $console.info({
              result,
              list
            });
            const historyList = list.map(item => new PublishItemData(item));
            $console.info({
              list,
              historyList
            });
            this.showResultList("历史观看", historyList, true);
          } catch (error) {
            $console.error(error);
            $.stopLoading();
            $ui.error(error.message);
          } finally {
            $console.info("showLaterToWatch.finally");
          }
        } else {
          $.stopLoading();
          $ui.error(result.message || `code:${result.code}`);
        }
      },
      fail => {
        $.stopLoading();
        $ui.error("fail:" + fail || "稍后再看出现未知错误");
      }
    );
  }
  showLaterToWatch() {
    $.startLoading();
    new LaterWatchCore(this.Auth).getList().then(
      result => {
        if (result.code == 0) {
          try {
            const list = result.data.list;
            $console.info({
              result,
              list
            });
            const historyList = list.map(item => new PublishItemData(item));
            $console.info({
              list,
              historyList
            });
            this.showResultList("稍后再看", historyList);
          } catch (error) {
            $console.error(error);
            $.stopLoading();
            $ui.error(error.message);
          } finally {
            $console.info("showLaterToWatch.finally");
          }
        } else {
          $.stopLoading();
          $ui.error(result.message || `code:${result.code}`);
        }
      },
      fail => {
        $.stopLoading();
        $ui.error("fail:" + fail || "稍后再看出现未知错误");
      }
    );
  }
}
class BiliModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.history",
      name: "哔哩哔哩收藏历史与稍后再看",
      version: "1"
    });
    this.View = new View(mod);
  }
  addLaterToWatch(bvid) {
    this.View.addLaterToWatch(bvid);
  }
  showHistory() {
    this.View.showHistory();
  }
  showLaterToWatch() {
    this.View.showLaterToWatch();
  }
}
module.exports = BiliModule;
