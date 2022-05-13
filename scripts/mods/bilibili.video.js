const { CoreModule } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();

class VideoInfo {
  constructor(coreModule) {
    this.Module = coreModule;
    this.Http = coreModule.Core.Http;
    this.UserModule = coreModule.Core.ModuleLoader.getModule("bilibili.user");
  }
  async getVideoInfo(bvid = "BV17x411w7KC") {
    const url = `http://api.bilibili.com/x/web-interface/view?vid=${bvid}`,
      resp = await this.Http.get({
        url,
        header: {
          cookie: this.UserModule.getCookie()
        }
      });
    $console.info({ response: resp.response });
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
        $console.info(resultData);
        return resultData;
      } else {
        $ui.error(result.code + codeMessageList[result.code.toString()]);
        return undefined;
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
    this.Info = new VideoInfo(this);
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
                title: `bvid:${videoInfo}`,
                func: undefined
              }
            ]
          }
        ];
        $ui.push({
          props: {
            title: bvid || "bv****"
          },
          views: [
            {
              type: "list",
              props: {
                data: videoInfoList.map(listItem => {
                  return {
                    title: listItem.title,
                    rows: listItem.items.map(item => item.title)
                  };
                })
              },
              layout: $layout.fill,
              events: {
                didSelect: (_sender, indexPath, _data) => {
                  const section = indexPath.section;
                  const row = indexPath.row;
                  try {
                    videoInfoList[section].items[row].func();
                  } catch (error) {
                    $console.error(error);
                  }
                }
              }
            }
          ]
        });
      } else {
        $ui.error("空白请求结果");
      }
    } else {
      $ui.error("请输入视频id");
    }
  }
}
module.exports = BilibiliVideo;
