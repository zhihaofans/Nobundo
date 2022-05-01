const { CoreModule } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();

class User {
  constructor({ core }) {
    this.Core = core;
    this.$ = core.$;
    this.Http = this.Core.http;
  }
  async getLaterToWatch(cookie) {
    $ui.loading(true);
    const url = "https://api.bilibili.com/x/v2/history/toview",
      header = { cookie },
      timeout = 5,
      resp = await this.$.http.get({
        url,
        header,
        timeout
      });
    $console.info({ resp });
    if (resp.error) {
      $ui.loading(false);
      $ui.alert({
        title: "获取失败",
        message: resp.error.message,
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    } else {
      $ui.loading(false);
      const result = resp.data;
      if (result) {
        if (result.code == 0) {
          const data = result.data,
            listCount = data.count,
            later2watchList = data.list;
          if (listCount > 0) {
            $ui.push({
              props: {
                title: `稍后再看共${listCount}个视频`
              },
              views: [
                {
                  type: "list",
                  props: {
                    autoRowHeight: true,
                    estimatedRowHeight: 44,
                    data: later2watchList.map(thisVideo => {
                      return {
                        title: `@${thisVideo.owner.name}(${thisVideo.owner.mid})`,
                        rows: [thisVideo.title]
                      };
                    })
                  },
                  layout: $layout.fill,
                  events: {
                    didSelect: (_sender, indexPath, _data) => {
                      const thisVideo = later2watchList[indexPath.section],
                        row = indexPath.row;
                      $app.openURL(thisVideo.short_link_v2);
                    }
                  }
                }
              ]
            });
          } else {
            $ui.error("请添加视频");
          }
        } else {
          $ui.alert({
            title: `错误${result.code}`,
            message: result.message,
            actions: [
              {
                title: "OK",
                disabled: false, // Optional
                handler: () => {}
              }
            ]
          });
        }
      } else {
        $ui.error("空白请求结果");
      }
    }
  }
}

class BilibiliVideo extends CoreModule {
  constructor(core) {
    super({
      coreId: "bilibili",
      moduleId: "bilibili.video",
      moduleName: "哔哩哔哩视频",
      version: "1"
      //author: "zhihaofans"
    });
    this.Core = core;
  }
  getUser() {
    return new User({
      core: this.Core
    });
  }
}
module.exports = BilibiliVideo;
