const { ModModule } = require("CoreJS"),
  $ = require("$"),
  HttpLib = require("HttpLib");
const TYPE_STR_LIST_NEW = {
  "DYNAMIC_TYPE_NONE": "无效动态",
  "DYNAMIC_TYPE_FORWARD": "动态转发",
  "DYNAMIC_TYPE_AV": "投稿视频",
  "DYNAMIC_TYPE_PGC": "剧集（番剧、电影、纪录片）",
  "DYNAMIC_TYPE_COURSES": "",
  "DYNAMIC_TYPE_WORD": "纯文字动态",
  "DYNAMIC_TYPE_DRAW": "带图动态",
  "DYNAMIC_TYPE_ARTICLE": "投稿专栏",
  "DYNAMIC_TYPE_MUSIC": "音乐",
  "DYNAMIC_TYPE_COMMON_SQUARE": "装扮、剧集点评、普通分享",
  //"DYNAMIC_TYPE_COMMON_VERTICAL": "",
  "DYNAMIC_TYPE_LIVE": "直播间分享",
  "DYNAMIC_TYPE_MEDIALIST": "收藏夹",
  "DYNAMIC_TYPE_COURSES_SEASON": "课程",
  //"DYNAMIC_TYPE_COURSES_BATCH": "",
  //"DYNAMIC_TYPE_AD": "",
  //"DYNAMIC_TYPE_APPLET": "",
  //"DYNAMIC_TYPE_SUBSCRIPTION": "",
  "DYNAMIC_TYPE_LIVE_RCMD": "直播开播",
  //"DYNAMIC_TYPE_BANNER": "",
  "DYNAMIC_TYPE_UGC_SEASON": "合集更新"
  //"DYNAMIC_TYPE_SUBSCRIPTION_NEW": ""
};
class NewDynamicItemData {
  constructor(item) {
    this.modules = item.modules;
    this.id_str = item.id_str;
    this.type = item.type;
    this.type_str = TYPE_STR_LIST_NEW[item.type] || item.type;
    this.visible = item.visible;
    this.author_id = item.modules.module_author.mid;

    this.author_face = item.modules.module_author.face;
    //this.cover = this.author_face;
    switch (item.type) {
      //带图动态
      case "DYNAMIC_TYPE_DRAW":
        this.text = this.modules.module_dynamic?.desc?.text || item.type;
        this.images =
          this.modules.module_dynamic.major?.draw?.items?.map(it => it.src) ||
          [];
        this.cover = this.images[0];
        break;
      case "DYNAMIC_TYPE_FORWARD":
        this.origin_dynamic = item?.orig;
        this.text = this.modules.module_dynamic.desc.text;
        if (this.origin_dynamic != undefined) {
          this.origin_dynamic_data = new NewDynamicItemData(
            this.origin_dynamic
          );
          this.type_str += "\n" + this.origin_dynamic_data.type_str;
          this.cover = this.origin_dynamic_data.cover || this.cover;
        }

        break;
      case "DYNAMIC_TYPE_LIVE_RCMD":
        this.content =
          JSON.parse(this.modules.module_dynamic.major.live_rcmd.content) || {};
        //$console.warn(this.content);
        this.text = "[直播]" + this.content.live_play_info.title;
        break;
      case "DYNAMIC_TYPE_AV":
        this.text = this.modules.module_dynamic.major.archive.title;
        this.cover = this.modules.module_dynamic.major.archive.cover;
        this.url = this.modules.module_dynamic.major.archive.jump_url;
        this.bvid = this.modules.module_dynamic.major.archive.bvid;
        break;
      case "DYNAMIC_TYPE_PGC_UNION":
        this.text = this.modules.module_dynamic.major.pgc.title;
        break;
      case "DYNAMIC_TYPE_WORD":
        this.text = this.modules.module_dynamic.desc.text;
        break;
      case "DYNAMIC_TYPE_ARTICLE":
        this.text = this.modules.module_dynamic.major.article.title;
        this.url = this.modules.module_dynamic.major.article.jump_url;
        this.images = this.modules.module_dynamic.major.article.covers;
        break;
    }
    //this.cover =this.modules.module_dynamic?.additional?.common?.cover ||
    //this.text=this.modules.module_dynamic?.desc.text
    //$console.warn(this.type_str);
    this.author_name = item.modules.module_author.name;
    //作者名不再附带动态类型
    //+ "\n" + this.type_str;
    if (
      this.cover !== undefined &&
      this.cover.length > 0 &&
      this.cover.indexOf("@1q.webp") < 0
    ) {
      this.cover += "@1q.webp";
    }
  }
}
class DynamicCore {
  constructor(mod) {
    this.Auth = mod.ModuleLoader.getModule("bilibili.auth");
  }
  getDynamicList(_offset = "") {
    return new Promise((resolve, reject) => {
      const url = `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?_offset=${_offset}`;
      try {
        $console.info("trystart");
        new HttpLib(url)
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
class DynamicView {
  constructor(mod) {
    this.Core = new DynamicCore(mod);
    this.Template = mod.ModuleLoader.getModule("bilibili.template");
    this.dynamicList = [];
    this.hasMore = true;
    this.OFFSET_ID = "";
  }
  init() {
    try {
      this.showSingleList();
    } catch (error) {
      $console.error(error);
    }
  }
  dynamicListToItemList() {
    return this.dynamicList.map(dynamicItem => {
      //$console.info(dynamicItem);
      //const typeStr = dynamicItem.dynamic_type_str;
      return {
        imageFace: {
          src: (dynamicItem.author_face + "@1q.webp").replace(
            "http://",
            "https://"
          )
        },
        labelTitle: {
          text: dynamicItem.text || "无标题"
        },
        labelAuthor: {
          text: dynamicItem.author_name
          //+ "\n" + `[${typeStr}]`
        },
        imageCover: {
          src: dynamicItem.cover
        }
      };
    });
  }
  showSingleList() {
    const didSelect = (section, row) => {
      const dynamicItem = this.dynamicList[row];
      switch (dynamicItem.type) {
        case "DYNAMIC_TYPE_DRAW":
          //this.DynamicDetailView.showImageDynamic(dynamicItem);
          break;
        case "DYNAMIC_TYPE_AV":
          //TODO: new PostDetailView().showVideoDetail(dynamicItem.bvid);
          break;
        default:
      }
    };
    $ui.push({
      props: {
        title: "动态"
      },
      views: [
        {
          type: "matrix",
          props: {
            id: "dynamicList",
            columns: 1,
            itemHeight: 300, //每行高度
            square: false,
            spacing: 2, //间隔
            template: this.Template.singlePostTemplate(),
            data: this.dynamicListToItemList(),
            header: {
              type: "label",
              props: {
                id: "header_dynamic",
                height: 20,
                text: `正在加载动态`,
                textColor: $color("#AAAAAA"),
                align: $align.center,
                font: $font(12)
              }
            },
            footer: {
              type: "label",
              props: {
                height: 20,
                text: "上拉看旧动态",
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
            /*
            didReachBottom: sender => {
              if (this.loadingNew == true) {
                return false;
              } else {
                $console.info("didReachBottom");
                
                //$.stopLoading();
                this.loadNewDynamic(sender);
              }
            },
*/
            ready: sender => this.loadNewDynamic(sender)
          }
        }
      ]
    });
  }
  loadNewDynamic(sender) {
    this.loadingNew = true;
    $.startLoading();
    $console.info({
      hasMore: this.hasMore,
      offset_id: this.OFFSET_ID
    });
    if (this.hasMore) {
      this.Core.getDynamicList(this.OFFSET_ID).then(
        result => {
          $console.info(result);
          if (result.code === 0) {
            if (result.data.offset === this.OFFSET_ID) {
              $.stopLoading();
              $ui.error("没有旧动态了!");
              this.loadingNew = false;
            } else {
              this.OFFSET_ID = result.data.offset;
              this.hasMore = result.data.has_more;
              sender.endFetchingMore();

              const newDynamicList = result.data.items.map(item => {
                try {
                  const _result = new NewDynamicItemData(item);
                  return _result;
                } catch (error) {
                  $console.error("===发生错误");
                  $console.error(error);
                  $console.error(item);
                  $console.error("错误结束===");
                  return undefined;
                }
              });
              this.dynamicList = this.dynamicList.concat(newDynamicList);
              this.reloadDynamicList();
            }
          } else {
            $ui.error(result.message);
            this.loadingNew = false;
          }
        },
        fail => {
          $.stopLoading();
          $console.error(fail);
          this.hasMore = false;
          $ui.error(fail || "未知错误");
          this.loadingNew = false;
        }
      );
    } else {
      $.stopLoading();
      $ui.error("没有旧动态了");
      this.loadingNew = false;
    }
  }
  reloadDynamicList() {
    $ui.get("dynamicList").data = this.dynamicListToItemList();
    $ui.get("dynamicList").get("header_dynamic").text = `共${
      this.dynamicList.length || 0
    }个动态`;
  }
}
class BiliModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.dynamic",
      name: "哔哩哔哩动态",
      version: "1"
    });
    this.Mod = mod;
  }
  init() {
    new DynamicView(this.Mod).init();
  }
}
module.exports = BiliModule;
