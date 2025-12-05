const { ModModule } = require("CoreJS"),
  $ = require("$"),
  HttpLib = require("HttpLib");
class DynamicDetailItem {
  constructor({ modules, id_str, type, basic, orig, visible }) {
    $console.info();
    this.id_str = id_str;
    this.type = type;
    this.major_type = modules.module_dynamic?.major?.type;
    //this.type_str = TYPE_STR_LIST_NEW[item.type] || item.type;
    this.visible = visible;
    this.author_id = modules.module_author.mid;
    this.author_face = modules.module_author.face;
    this.author_name = modules.module_author.name;
    this.pushTime = modules.module_author.pub_time;
    this.onlyFans = basic.is_only_fans || false;
    switch (this.major_type) {
      case "MAJOR_TYPE_OPUS":
        this.opus = modules.module_dynamic.major.opus;
        break;
      case "MAJOR_TYPE_BLOCKED":
        this.opus = modules.module_dynamic.major.blocked;
        break;
    }
    switch (type) {
      case "DYNAMIC_TYPE_DRAW":
        //图文动态
        this.draw = modules.module_dynamic.major?.draw;
        this.text =
          modules.module_dynamic?.desc?.text ||
          this.opus?.title ||
          this.opus?.summary?.text ||
          modules.module_dynamic.additional?.reserve?.title ||
          "未知";
        this.images =
          this.draw?.items?.map(it => it.src) ||
          this.opus?.pics?.map(it => it.url) ||
          [];
        break;
      default:
    }
    this.cover = this.images[0];
  }
}
class ContentCore {
  constructor(mod) {
    this.Auth = mod.ModuleLoader.getModule("bilibili.auth");
  }
  getDynamicDetail(id) {
    return new Promise((resolve, reject) => {
      const url = "https://api.bilibili.com/x/polymer/web-dynamic/v1/detail",
        params = {
          id,
          features: "itemOpusStyle,listOnlyfans,onlyfansVote,onlyfansAssetsV2"
        };
      try {
        $console.info("trystart");
        new HttpLib(url)
          .params(params)
          .cookie(this.Auth.getCookie())
          .get()
          .then(resp => {
            if (resp.isError) {
              reject(resp.errorMessage);
            } else {
              resolve(resp.data);
            }
          })
          .catch(fail => reject(fail));
        $console.info("try");
      } catch (error) {
        $console.error(error);
        reject(error);
      }
    });
  }
}
class ContentView {
  constructor(mod) {}
  getImageView(resultData) {
    const imageList = resultData.images;
    $console.info({
      imageList
    });
    if ($.isArray(imageList) && imageList.length > 0) {
      if (imageList.length < 1) {
        return {
          type: "image",
          props: {
            src: imageList[0],
            id: "imageSingleCover"
          },
          layout: (make, view) => {
            make.centerX.equalTo(view.super);
            //make.size.equalTo($size(100, 100));
            make.top.equalTo($ui.get("labelTitle").bottom).offset(10);
            make.left.right.equalTo(5);
          },
          events: {
            tapped: (sender, indexPath, data) => {
              $quicklook.open({
                url: imageList[0],
                handler: () => {
                  // Handle dismiss action, optional
                }
              });
            }
          }
        };
      } else {
        const view = {
          type: "matrix",
          props: {
            id: "imageMultCover",
            //bgcolor: $color("#FF0000"),
            columns: 3,
            itemHeight: 100,
            spacing: 5,
            data: imageList.map(img => {
              $console.info(img);
              return {
                imageSingleCover: {
                  src: img
                }
              };
            }),
            template: {
              props: {},
              views: [
                {
                  type: "image",
                  props: {
                    id: "imageSingleCover"
                  },
                  layout: (make, view) => {
                    make.centerX.equalTo(view.super);
                    make.size.equalTo($size(100, 100));
                  },
                  events: {
                    tapped: (sender, indexPath, data) => {
                      $quicklook.open({
                        url: imageList[0],
                        handler: () => {
                          // Handle dismiss action, optional
                        }
                      });
                    }
                  }
                }
              ]
            }
          },
          layout: (make, view) => {
            make.center.equalTo(view.center);
            make.left.equalTo(0);
            make.top.equalTo($ui.get("labelTitle").bottom);
            make.bottom.equalTo(view.bottom);
            make.right.equalTo(view.right);
          }
        };

        return view;
      }
    } else {
      return undefined;
    }
  }
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
}
class BiliModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.content",
      name: "哔哩哔哩内容模块",
      version: "1"
    });
    this.Mod = mod;
    this.Core = new ContentCore(mod);
    this.View = new ContentView(mod);
  }
  getDynamicDetail(id) {
    if ($.hasString(id)) {
      $.startLoading();
      this.Core.getDynamicDetail(id).then(
        resu => {
          $.stopLoading();
          $console.info({
            resu
          });
          if (resu.code == 0 && resu.data.item !== undefined) {
            try {
              this.View.showDynamicDetail(
                new DynamicDetailItem(resu.data.item)
              );
            } catch (error) {
              $console.error(error);
              $ui.error(error.message);
            }
          } else {
            $ui.error(resu.message || `code:${resu.code}`);
          }
        },
        fail => {
          $.stopLoading();
          $ui.error(fail);
        }
      );
    } else {
      $ui.error("空白id");
    }
  }
}
module.exports = BiliModule;
