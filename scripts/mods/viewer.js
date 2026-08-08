const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$"),
  { GridView, Storage } = require("Next");
class ViewerCore {
  constructor() {}
  showDynamicDetail(resultData) {
    const viewData = {
      props: {
        title: "动态详情"
      },
      views: [
        {
          type: "scroll",
          layout: $layout.fill,
          events: {
            ready: sender => {}
          },
          views: [
            {
              type: "image",
              props: {
                cornerRadius: 10,
                smoothCorners: true,
                src: resultData.author_face,
                id: "imageUserCover"
              },
              layout: (make, view) => {
                make.size.equalTo($size(40, 40));
                make.left.top.equalTo(5);
              },
              events: {
                tapped: (sender, indexPath, data) => {
                  $quicklook.open({
                    url: resultData.face,
                    handler: () => {
                      // Handle dismiss action, optional
                    }
                  });
                }
              }
            },
            {
              type: "label",
              props: {
                id: "labelUname",
                text: resultData.author_name,
                align: $align.center,
                lines: 1,
                font: $font(24)
              },
              layout: (make, view) => {
                make.left.equalTo($ui.get("imageUserCover").right).offset(10);
                make.top.equalTo($ui.get("imageUserCover").top).offset(4);
              }
            },
            {
              type: "label",
              props: {
                id: "labelTitle",
                text: resultData.text,
                align: $align.left,
                lines: 10,
                font: $font(12)
              },
              layout: (make, view) => {
                make.top.equalTo($ui.get("imageUserCover").bottom).offset(4);
                make.left.equalTo(10);
                make.right.equalTo(0).offset(-30);
              }
            },
            this.getImageView(resultData)
          ]
        }
      ]
    };
    $ui.push(viewData);
  }
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
      coreVersion: 18,
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
      case "zhihaofans.viewer.bilibili.dynamic_detail":
        new ViewerCore().openImage({
          urlList: data.images,
          thumbUrlList: data.thumbUrlList
        });
        break;
      default:
        this.run();
    }
  }
}
module.exports = Viewer;
