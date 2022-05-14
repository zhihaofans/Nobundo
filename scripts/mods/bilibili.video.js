const { CoreModule } = require("../../Core.js/core");

class VideoInfo {
  constructor(coreModule) {
    this.Module = coreModule;
    this.Http = coreModule.Core.Http;
  }
  async getVideoInfo(bvid = "BV17x411w7KC") {
    const cookie = this.Module.Core.ModuleLoader.getModule(
        "bilibili.user"
      ).getCookie(),
      url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
      resp = await this.Http.get({
        url,
        timeout: 5,
        header: {
          cookie
        }
      });
    //    $console.info({ response: resp.response });
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
        //        $console.info(resultData);
        return resultData;
      } else {
        $console.error(result.code + codeMessageList[result.code.toString()]);
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
                title: videoInfo.bvid,
                func: undefined
              },
              {
                title: "av" + videoInfo.aid,
                func: undefined
              }
            ]
          },
          {
            title: "作者",
            items: [
              {
                title: videoInfo.owner.mid
              },
              {
                title: "@" + videoInfo.owner.name,
                func: () => {
                  $share.sheet([videoInfo.owner.name]);
                }
              }
            ]
          }
          
        ];
        $ui.loading(false);
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
                    title: listItem.title.toString(),
                    rows: listItem.items.map(item => item.title.toString())
                  };
                })
              },
              layout: $layout.fill,
              events: {
                didSelect: (_sender, indexPath, _data) => {
                  const section = indexPath.section;
                  const row = indexPath.row,
                    selectedItem = videoInfoList[section].items[row];
                  if (
                    selectedItem.func != undefined &&
                    typeof selectedItem.func == "function"
                  )
                    try {
                      selectedItem.func();
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
