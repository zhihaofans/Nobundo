const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  $ = require("$");
class VideoData {
  constructor(videoData) {
    this.author_face = videoData.owner.face;
    this.author_mid = videoData.owner.mid;
    this.author_name = videoData.owner.name;
    this.avid = videoData.aid;
    this.bvid = videoData.bvid;
    this.copyright = videoData.copyright; //1：原创 2：转载
    this.cover_image = videoData.pic; //视频封面
    this.desc = videoData.desc; //简介
    this.parts_count = videoData.videos; //稿件分P总数
    this.publish_location = videoData.pub_location; //发布定位
    this.publish_time = videoData.pubdate; //发布时间
    this.short_link = videoData.short_link_v2 || videoData.short_link;
    this.staff = videoData.staff; //合作成员列表
    this.tid = videoData.tid; //分区id
    this.title = videoData.title;
    this.tname = videoData.tname; //子分区名称
    this.upload_time = videoData.ctime; //投稿时间戳
  }
}
class PopularVideo {
  constructor(modModule) {
    this.Module = modModule;
  }
  async getPopularVideoList(isLogin = true) {
    const cookie = isLogin
        ? this.Module.Mod.ModuleLoader.getModule("bilibili.user").getCookie()
        : undefined,
      url = `https://api.bilibili.com/x/web-interface/popular`,
      resp = await this.Module.Http.get({
        url,
        params: {
          pn: 1,
          ps: 20
        },
        header: {
          cookie
        }
      });
    if (resp.error) {
      $console.error(resp.error);
      return undefined;
    } else {
      const result = resp.data;
      if (result.code == 0) {
        //resultData={list:[热门视频列表],no_more:true下页没有数据\false下页还有数据}
        const resultData = { no_more: result.data.no_more, list: [] };
        resultData.list = result.data.list.map(video => new VideoData(video));
        return resultData;
      } else {
        const { code, message } = result;
        $console.error({
          code,
          message
        });
        return undefined;
      }
    }
  }
}

class VideoInfo {
  constructor(modModule) {
    this.Module = modModule;
  }
  async getVideoInfo(bvid = "BV17x411w7KC") {
    const cookie = this.Module.Mod.ModuleLoader.getModule(
        "bilibili.user"
      ).getCookie(),
      url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
      resp = await this.Module.Http.get({
        url,
        header: {
          cookie
        }
      });
    if (resp.error) {
      return undefined;
    } else {
      const result = resp.data,
        resultData = result.data,
        codeMessageList = {
          "0": "成功",
          "-400": "请求错误",
          "-403": "权限不足",
          "-404": "无视频",
          "62002": "稿件不可见",
          "62004": "稿件审核中"
        };
      if (result.code == 0) {
        return resultData;
      } else {
        $console.error(result.code + codeMessageList[new String(result.code)]);
        return undefined;
      }
    }
  }
  pushVideoInfoList(title, videoList) {
    $ui.push({
      props: {
        title
      },
      views: [
        {
          type: "list",
          props: {
            autoRowHeight: true,
            estimatedRowHeight: 44,
            data: videoList.map(thisVideo => {
              return {
                title: `${thisVideo.author_mid}@${thisVideo.author_name}`,
                rows: [
                  `av${thisVideo.avid} | ${thisVideo.bvid}`,
                  thisVideo.title
                ]
              };
            })
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const selectVideo = videoList[indexPath.section];
              $ui.menu({
                items: ["查看视频信息", "通过哔哩哔哩APP打开"],
                handler: (title, idx) => {
                  switch (idx) {
                    case 0:
                      try {
                        this.Module.showVideoInfo(selectVideo.bvid);
                      } catch (error) {
                        $console.error(error);
                        $ui.error("Error");
                      }
                      break;
                    case 1:
                      $app.openURL(selectVideo.short_link);

                      break;
                    default:
                  }
                }
              });
            }
          }
        }
      ]
    });
  }
}
class VideoUi {
  constructor(modModule) {
    this.ModModule = modModule;
    this.Popular = modModule.Popular;
  }
  async getPopularVideo() {
    $ui.loading(true);
    try {
      const popularList = await this.Popular.getPopularVideoList();
      this.ModModule.Info.pushVideoInfoList("前20个热门视频", popularList.list);
    } catch (error) {
      $console.error(error);
    } finally {
      $ui.loading(false);
    }
  }
  getViewUiList() {
    return [
      {
        title: "热门视频",
        func: () => this.getPopularVideo()
      },
      {
        title: "排行榜视频",
        func: () => {
          //          $safari.open({
          //            url: "https://m.bilibili.com/ranking",
          //            entersReader: true,
          //            height: 360,
          //            handler: test => {
          //              $console.info({
          //                test
          //              });
          //            }
          //          });
          this.showVideoListWeb("https://m.bilibili.com/ranking", () => {
            $console.info("已关闭排行榜网页");
          });
        }
      }
    ];
  }
  showVideoListWeb(url, callback) {
    const modLoader = this.ModModule.Mod.App.modLoader,
      urlStartsWithBlacklist = ["https://d.bilibili.com", "bilibili://"];
    try {
      if (url == undefined || url.length == 0) {
        if ($.isFunction(callback)) {
          callback();
        } else {
          return undefined;
        }
      } else {
      }
      modLoader.runModApi({
        modId: "web_browser",
        apiId: "web_browser.openurl",
        data: {
          url,
          header: {},
          decideNavigation: (sender, action) => {
            const url = action.requestURL;
            $console.info(url);
            if (url.startsWith("https://m.bilibili.com/video/BV")) {
              return false;
            }
            if (
              !url.startsWith("https://") &&
              !url.startsWith("http://") &&
              !$.string.startsWithList(url, urlStartsWithBlacklist)
            ) {
              $ui.error("已拦截非法链接");
              $ui.title = sender.title;
              return false;
            }
            return true;
          }
        },
        callback
      });
    } catch (error) {
      $console.error(error);
    }
  }
}

class BilibiliVideo extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.video",
      name: "哔哩哔哩视频",
      version: "2"
    });
    this.$ = $;
    this.Http = new Next.Http(5);
    this.Info = new VideoInfo(this);
    this.Popular = new PopularVideo(this);
  }
  getVideoDataObject(videoItem) {
    return new VideoData(videoItem);
  }
  getViewUiList() {
    return new VideoUi(this).getViewUiList();
  }
  async showVideoInfo(bvid) {
    if (bvid != undefined && bvid.length > 0) {
      $ui.loading(true);
      const videoInfo = await this.Info.getVideoInfo(bvid);
      if (videoInfo != undefined) {
        const videoInfoList = [
          {
            title: "视频id",
            items: [
              {
                title: videoInfo.bvid,
                func: () => {}
              },
              {
                title: "av" + videoInfo.aid,
                func: undefined
              }
            ]
          },
          {
            title: "标题",
            items: [
              {
                title: videoInfo.title,
                func: () => {
                  $share.sheet([videoInfo.title]);
                }
              }
            ]
          },
          {
            title: "作者",
            items: [
              {
                title: videoInfo.owner.mid,
                func: () => {
                  this.Mod.biliLauncher.space(videoInfo.owner.mid);
                }
              },
              {
                title: "@" + videoInfo.owner.name,
                func: () => {
                  $share.sheet([videoInfo.owner.name]);
                }
              }, {
                title: "查看头像",
                func: () => {
                  $ui.preview({
                                              url: videoInfo.owner.face
                                            });
                }
              }
            ]
          },
          {
            title: "视频封面",
            items: [
              {
                title: videoInfo.pic,
                func: () => {
                  $ui.menu({
                    items: ["预览", "下载"],
                    handler: (title, idx) => {
                      switch (idx) {
                        case 0:
                          $ui.preview({
                            url: videoInfo.pic
                          });
                          break;
                        case 1:
                          try {
                            $console.warn("try downloading");
                            this.Mod.App.ModLoader.runModApi({
                              modId: "downloader",
                              apiId: "start_downloading",
                              data: { url: videoInfo.pic }
                            });
                            $console.warn("finished try");
                          } catch (error) {
                            $console.error(error);
                            $ui.error("下载失败");
                          }
                          break;
                        default:
                      }
                    }
                  });
                }
              }
            ]
          }
        ];
        $ui.loading(false);
        $ui.push({
          props: {
            title: bvid
          },
          views: [
            {
              type: "list",
              props: {
                autoRowHeight: true,
                estimatedRowHeight: 10,
                data: videoInfoList.map(listItem => {
                  return {
                    title: listItem.title.toString(),
                    rows: listItem.items.map(item => item.title.toString())
                  };
                })
              },
              layout: $layout.fill,
              events: {
                didSelect: (sender, indexPath, data) => {
                  const section = indexPath.section,
                    row = indexPath.row,
                    selectedItem = videoInfoList[section].items[row];
                  if (this.$.isFunction(selectedItem.func))
                    try {
                      selectedItem.func(sender, data);
                    } catch (error) {
                      $console.error(error);
                    }
                }
              }
            }
          ]
        });
      } else {
        $ui.loading(false);
        $ui.error("空白请求结果,请检查视频id与设备网络");
      }
    } else {
      $ui.loading(false);
      $ui.error("请输入视频id");
    }
  }
}
module.exports = BilibiliVideo;
