const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  ListViewKit = new Next.ListView();

class VideoUi {
  constructor(mod) {
    this.Mod = mod;
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
}
class BilibiliUi extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.ui",
      name: "哔哩哔哩用户界面",
      version: "1"
    });
    this.VideoUi = new VideoUi(this.Mod);
  }
  initUi() {
    const videoUiList = this.VideoUi.getViewUiList();
    $ui.push({
      props: {
        title: "listview"
      },
      views: [
        {
          type: "list",
          props: {
            data: [
              {
                title: "视频",
                rows: videoUiList.map(item => item.title)
              }
            ]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {}
          }
        }
      ]
    });
  }
}
module.exports = BilibiliUi;
