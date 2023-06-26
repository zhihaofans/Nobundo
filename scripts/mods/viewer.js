const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$"),
  { GridView, Storage } = require("Next");
class ViewerCore {
  constructor() {}
  openImage({ images, urlList, thumbUrlList }) {
    if (urlList) {
      try {
        new GridView().showWaterfallImages({
          title: "浏览图片",
          imageList: thumbUrlList ? thumbUrlList : urlList,
          columns: 3,
          onClick: (index, url) => {
            const imgUrl = urlList[index],
              thumbUrl = thumbUrlList ? thumbUrlList[index] : undefined;
            $console.info({
              imgUrl,
              thumbUrl
            });
            $ui.menu({
              items: ["预览", "保存"],
              handler: (title, idx) => {
                switch (idx) {
                  case 0:
                    $quicklook.open({
                      url
                    });
                    break;
                  case 1:
                    $photo.save({
                      image: $image(url),
                      handler: success => {
                        $.toast(success, "保存成功", "保存失败");
                      }
                    });
                    break;
                  default:
                }
              }
            });
          }
        });
      } catch (error) {
        $console.error(error);
      }
    } else if (images) {
    } else {
      $ui.error("need image");
    }
  }
}
class Viewer extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "viewer",
      modName: "内容查看器",
      version: "1",
      author: "zhihaofans",
      coreVersion: 12,
      useSqlite: true,
      allowWidget: true,
      allowApi: true,
      apiList: [
        {
          apiId: "zhihaofans.viewer.open.image",
          func: ({ data, callback }) => {
            new ViewerCore().openImage({
              urlList: data.images,
              thumbUrlList: data.thumbs
            });
          }
        }
      ]
    });
    this.$ = $;
    this.Storage = Storage;
    this.ModuleLoader = new ModuleLoader(this);
    //this.ModuleLoader.addModule("example.ui.js");
  }
  run() {
    try {
      //this.runSqlite();
      new ViewerCore().openImage({
        urlList: [
          "https://help.ys7.com/ys7_helpcenter_h5/assets/desktopGuide/banner.png",
          "https://help.ys7.com/ys7_helpcenter_h5/assets/desktopGuide/step1.png",
          "https://help.ys7.com/ys7_helpcenter_h5/assets/desktopGuide/banner.png",
          "https://ci.xiaohongshu.com/24f80c55-7e06-e459-f420-95f46648ef89?imageView2/2/w/1080/format/jpg",
          "https://help.ys7.com/ys7_helpcenter_h5/assets/desktopGuide/step1.png",
          "https://help.ys7.com/ys7_helpcenter_h5/assets/desktopGuide/banner.png",
          "https://help.ys7.com/ys7_helpcenter_h5/assets/desktopGuide/step1.png"
        ]
      });
    } catch (error) {
      $console.error(error);
    }
    //$ui.success("run");
  }
  runWidget(widgetId) {
    $widget.setTimeline({
      render: ctx => {
        return {
          type: "text",
          props: {
            text: widgetId || "Hello!"
          }
        };
      }
    });
  }
  runApi({ apiId, data, callback }) {
    $console.info({
      _: "viewer.runApi",
      apiId,
      data,
      callback
    });
    switch (apiId) {
      case "zhihaofans.viewer.open.image":
        new ViewerCore().openImage({
          urlList: data.images,
          thumbUrlList: data.thumbUrlList
        });
        break;
      default:
        this.run();
    }
  }
  runSqlite() {
    const sqlite_key = "last_run_timestamp",
      lastRunTimestamp = this.SQLITE.getItem(sqlite_key);

    this.SQLITE.setItem(sqlite_key, new Date().getTime().toString());
    $console.info({
      mod: this.MOD_INFO,
      lastRunTimestamp
    });
  }
}
module.exports = Viewer;
