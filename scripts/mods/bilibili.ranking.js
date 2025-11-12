const { ModModule } = require("CoreJS"),
  $ = require("$"),
  HttpLib = require("HttpLib");
function timeDiffToString(oldTime) {
  try {
    const diff = $.getSecondUnixTime() - oldTime;
    const units = [
      { sec: 365 * 24 * 3600, label: "年" },
      { sec: 30 * 24 * 3600, label: "个月" },
      { sec: 24 * 3600, label: "天" },
      { sec: 3600, label: "小时" },
      { sec: 60, label: "分钟" },
      { sec: 1, label: "秒" }
    ];
    for (const u of units) {
      if (diff >= u.sec) {
        const v = Math.floor(diff / u.sec);
        const str = `${v}${u.label}`;
        if (diff < 0) {
          return str + "后";
        } else {
          return str + "前";
        }
      }
    }
    return "神秘时空";
  } catch (error) {
    $console.error(error);
    return "错乱时空";
  }
}
class VideoInfo {
  constructor(data) {
    this.aid = data.aid;
    this.avid = data.aid;
    this.bvid = data.bvid;
    this.video_count = data.videos; //稿件分P总数
    this.cover = data.pic;
    this.title = data.title;
    this.datetime = data.pubdate;
    this.author_id = data.owner.mid;
    this.author_face = data.owner.face;
    this.author_name = data.owner.name;
  }
}
class RankingCore {
  constructor(mod) {
    this.Auth = mod.ModuleLoader.getModule("bilibili.auth");
  }
  getRanking() {
    return new Promise((resolve, reject) => {
      const url = `https://api.bilibili.com/x/web-interface/ranking/v2`;
      new HttpLib(url)
        //.cookie(this.Auth.getCookie())
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
                reject(`code ${result.code}:${result.message}`);
              }
            }
          },
          fail => reject(fail)
        );
    });
  }
  getPrecious() {
    //入站必刷
    return new Promise((resolve, reject) => {
      const url = "https://api.bilibili.com/x/web-interface/popular/precious";
      new HttpLib(url)
        //.cookie(this.Auth.getCookie())
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
                reject(`code ${result.code}:${result.message}`);
              }
            }
          },
          fail => reject(fail)
        );
    });
  }
}
class RankingView {
  constructor(mod) {
    this.Core = new RankingCore(mod);
    this.Template = mod.ModuleLoader.getModule("bilibili.template");
    this.History = mod.ModuleLoader.getModule("bilibili.history");
    this.Video = mod.ModuleLoader.getModule("bilibili.video");
  }
  showResult(title, videoList) {
    const itemList = videoList.map(thisVideo => {
        return {
          labelTitle: {
            text: thisVideo.title
          },
          labelAuthor: {
            text: thisVideo.author_name
          },
          imageCover: {
            src: thisVideo.cover + "@1q.webp"
          },
          imageFace: {
            src: thisVideo.author_face + "@1q.webp"
          },
          labelTime: {
            text: timeDiffToString(thisVideo.datetime)
          }
        };
      }),
      didSelect = (section, row) => {
        const videoItem = videoList[row];
        this.Video.getVideoInfo(videoItem.bvid);
      };
    $ui.push({
      props: {
        title
        //navButtons: isHistory !== true ? later2watchNavMenu : undefined
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
  getRankingList() {
    $.startLoading();
    this.Core.getRanking().then(data => {
      $.stopLoading();
      const rankingList = data.list;
      $console.info({
        data
      });
      if (rankingList.length > 0) {
        try {
          this.showResult(
            "热门榜",
            rankingList.map(v => new VideoInfo(v))
          );
        } catch (error) {
          $console.error(error);
        }
      } else {
        $ui.error("排行榜数量为零");
      }
    }),
      fail => {
        $.stopLoading();
        $ui.error(fail);
      };
  }
  getPreciousList() {
    $.startLoading();
    this.Core.getPrecious().then(data => {
      $.stopLoading();
      const rankingList = data.list;
      $console.info({
        data
      });
      if (rankingList.length > 0) {
        try {
          this.showResult(
            data.title,
            rankingList.map(v => new VideoInfo(v))
          );
        } catch (error) {
          $console.error(error);
        }
      } else {
        $ui.error("入站必刷数量为零");
      }
    }),
      fail => {
        $.stopLoading();
        $ui.error(fail);
      };
  }
}
class BiliModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.ranking",
      name: "哔哩哔哩热门排行榜",
      version: "1"
    });
    this.Mod = mod;
  }
  getPreciousList() {
    new RankingView(this.Mod).getPreciousList();
  }
  getRankingList() {
    new RankingView(this.Mod).getRankingList();
  }
}
module.exports = BiliModule;
