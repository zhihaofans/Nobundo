const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  ListViewKit = new Next.ListView();
class NeteaseMusic {
  constructor() {
    this.Http = new Next.Http(5);
    this.HEADER = {
      crypto: "weapi",
      cookie:
        "_ntes_nnid=43ced510a167e3aa7efe87b02a4ddd22,1691908503620; _ntes_nuid=43ced510a167e3aa7efe87b02a4ddd22; JSESSIONID-WYYY=zijCMJd1x6VJE0IcU3R4h2JMF%2FUY6qyft3TU8PPKW0Sx%2FsMwMAAJHnwmTVjrp1msB%5CpIweg1GHNflNEbFwrrQqr%2F%2Bb6nzDFi7o3pZGN6b%2BFhezP5vt4tTYjZnzAnT3rIWDNJv6XD3mbsh199xdNj6CjHvEjQGWOf1gZ4SJ4k0qngF2Fm%3A1691910303514; WEVNSM=1.0.0; WNMCID=krivoj.1691908503936.01.0; _iuqxldmzr_=33; NMTID=00OY1OOllIGeBhyRUjtgLOcMB6uy3YAAAGJ7Zry0w",
      realIP: "1.1.1.1"
    };
  }
  search(keyword) {
    return new Promise((resolve, reject) => {
      const url = `https://music.163.com/weapi/search/get`;
      const body = {
        s: keyword,
        type: 1, // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
        limit: 30,
        offset: 0
      };
      this.Http.postThen({
        url,
        body,
        header: this.HEADER
      }).then(resp => {
        $console.info(resp);
        resolve(resp.data);
      }, reject);
    });
  }
  searchWeb() {
    return new Promise((resolve, reject) => {
      const url = "https://interface.music.163.com/weapi/search/get";
      this.Http.postThen({
        url
        //body
        //header: this.HEADER
      }).then(resp => {
        $console.info(resp);
        resolve(resp.data);
      }, reject);
    });
  }
}
class Main {
  constructor(mod) {
    this.Mod = mod;
  }
  multListTest() {
    const listData = [
      {
        title: "标题1",
        subTitle: "2022/07/22 内容1"
      },
      {
        title: "标题2",
        subTitle: "内容2"
      }
    ];
    ListViewKit.pushTwoLineList({
      title: "example 1",
      items: listData
    });
  }
  gridViewTest() {
    $ui.push({
      props: {
        title: ""
      },
      views: [
        {
          type: "matrix",
          props: {
            columns: 3,
            itemHeight: 100,
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
                            id: "icon"
                          },
                          layout: function (make, view) {
                            make.center.equalTo(view.super);
                            make.size.equalTo($size(50, 50));
                          }
                        },
                        {
                          type: "label",
                          props: {
                            id: "label",

                            align: $align.left,
                            font: $font(24)
                          },
                          layout: make => {
                            make.height.equalTo(20);
                            make.left.top.right.inset(0);
                          }
                        }
                      ]
                    }
                  },
                  layout: $layout.fill
                }
              ]
            },
            data: [
              {
                label: {
                  text: "example 1"
                },
                icon: {
                  src:
                    "https://images.apple.com/v/ios/what-is/b/images/performance_large.jpg"
                }
              },
              {
                label: {
                  text: "example 1"
                },
                icon: {
                  src:
                    "https://images.apple.com/v/ios/what-is/b/images/performance_large.jpg"
                }
              },
              {
                icon: {
                  icon: $icon("005", $color("red"), $size(12, 12))
                }
              },
              {
                label: {
                  text: "example 1"
                }
              },
              {
                label: {
                  text: "example 1"
                }
              }
            ]
          },
          layout: $layout.fill
        }
      ]
    });
  }
  init() {
    const mainViewList = ["网易"],
      didSelect = index => {
        switch (index) {
          case 0:
            this.multListTest();
            break;
          case 1:
            this.gridViewTest();
            break;
          default:
            $ui.alert({
              title: index,
              message: mainViewList[index],
              actions: [
                {
                  title: "OK",
                  disabled: false, // Optional
                  handler: () => {}
                }
              ]
            });
        }
      };
    ListViewKit.pushSimpleText(this.Mod.MOD_INFO.NAME, mainViewList, didSelect);
  }
}

class SearchMusic extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "search.music",
      name: "音乐搜索",
      version: "1"
      //author: "zhihaofans"
    });
    //this.Mod = mod;
    //$console.info(this.Mod);
  }
  initUi() {
    //$ui.success("run");
    new Main(this.Mod).init();
  }
  searchNetease(keyword) {
    return new NeteaseMusic().search(keyword);
  }
}
module.exports = SearchMusic;
