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
  openVideo({ title, image, video }) {
    if (image && video) {
      try {
        new GridView().showWaterfallImages({
          title: title || "浏览视频",
          imageList: [image],
          columns: 2,
          onClick: (index, url) => {
            $console.info({
              title,
              image,
              video
            });
            $ui.menu({
              items: ["预览图片", "保存图片", "预览视频", "保存视频"],
              handler: (title, idx) => {
                switch (idx) {
                  case 0:
                    $quicklook.open({
                      image
                    });
                    break;
                  case 1:
                    $photo.save({
                      image: $image(image),
                      handler: success => {
                        $.toast(success, "保存成功", "保存失败");
                      }
                    });
                    break;
                  case 2:
                    $ui.preview({
                      title: title || "预览视频",
                      url: video
                    });

                    break;
                  default:
                    $ui.error("error");
                }
              }
            });
          }
        });
      } catch (error) {
        $console.error(error);
      }
    } else {
      $ui.error("需要视频与封面图");
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
        },
        {
          apiId: "zhihaofans.viewer.open.video",
          func: ({ data, callback }) => {
            new ViewerCore().openVideo({
              image: data.image,
              video: data.video,
              title: data.title
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
      const defaultImg = "https://api.likepoems.com/img/bing";
      new ViewerCore().openImage({
        urlList: [defaultImg, defaultImg, defaultImg, defaultImg, defaultImg]
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
