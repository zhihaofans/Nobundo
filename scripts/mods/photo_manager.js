const { ModCore } = require("../../Core.js/core");
class PhotoData {
  constructor(photo) {
    this.Photo = photo;
  }
  getPhoto() {
    return this.Photo;
  }
  getJpg() {
    return this.Photo.jpg;
  }
  getPng() {
    return this.Photo.png;
  }
  hasQrcode() {
    const decodeResult = $qrcode.decode(this.getPng());
    return decodeResult != undefined && decodeResult.length > 0;
  }
}

class PhotoManagerApi {
  constructor(mod) {
    this.Mod = mod;
  }
  getPhotoList(
    count = 3,
    handler = images => {
      $console.info(images);
      $quicklook.open({
        type: "png",
        data: images[0].png
      });
    }
  ) {
    $photo.fetch({ count, handler });
  }
}
class PhotoManagerView {
  constructor(mod) {
    this.Mod = mod;
    this.Api = new PhotoManagerApi(mod);
  }
  init() {
    $ui.push({
      props: {
        title: this.Mod.MOD_INFO.NAME
      },
      views: [
        {
          type: "list",
          props: {
            data: ["获取最新10张照片"]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const section = indexPath.section,
                row = indexPath.row;
              switch (row) {
                case 0:
                  this.getTenPhotoList();
                  break;
                default:
              }
            }
          }
        }
      ]
    });
  }
  getTenPhotoList() {
    $ui.loading(true);
    $photo.fetch({
      count: 10,
      handler: images => {
        $console.info(images);
        const imageStrList = images.map(img => {
          // const photoData = new PhotoData(img);
          return `${img.size.height}x${img.size.width}`;
        });
        $ui.loading(false);
        $ui.push({
          props: {
            title: "最新10张照片"
          },
          views: [
            {
              type: "matrix",
              props: {
                columns: 3,
                itemHeight: 50,
                spacing: 5,
                template: {
                  props: {},
                  views: [
                    {
                      type: "stack",
                      props: {
                        axis: $stackViewAxis.vertical,
                        spacing: 5,
                        distribution: $stackViewDistribution.fillProportionally,
                        stack: {
                          views: [
                            {
                              type: "image",
                              props: {
                                id: "image"
                              },
                              layout: (make, view) => {
                                make.center.equalTo(view.super);
                                make.size.equalTo($size(50, 50));
                              }
                            }
                          ]
                        }
                      },
                      layout: $layout.fill
                    }
                  ]
                },
                data: images.map(img => {
                  return {
                    image: {
                      data: img.png
                    }
                  };
                })
              },
              layout: $layout.fill
            }
          ]
        });
      }
    });
  }
}

class PhotoManager extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "photo_manager",
      modName: "相册管理器",
      version: "1",
      author: "zhihaofans",
      coreVersion: 7,
      useSqlite: false
    });
    this.View = new PhotoManagerView(this);
  }
  run() {
    //    $ui.success("run");
    this.View.init();
  }
}
module.exports = PhotoManager;
