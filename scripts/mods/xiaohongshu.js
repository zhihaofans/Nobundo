const { ModCore } = require("CoreJS"),
  $ = require("$"),
  { Http, Storage } = require("Next");
class HttpCore {
  constructor() {
    this.Http = new Http();
  }
  get(url) {
    return this.Http.getThen({
      url,
      header: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
      }
    });
  }
  post(url, body) {
    return this.Http.postThen({
      url,
      header: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
        "Content-Type": "application/json"
      },
      body
    });
  }
}
class XHSCore {
  constructor() {
    this.Http = new HttpCore();
  }
  getNote(note_id) {
    return new Promise((resolve, reject) => {
      const url = `https://edith.xiaohongshu.com/api/sns/web/v1/feed`,
        body = { "source_note_id": note_id };
      this.Http.post(url, body).then(resp => {
        $console.info(resp);
      });
    });
  }
  getNoteByUrl(webUrl) {
    return new Promise((resolve, reject) => {
      const url =
        `https://011.163740.com/App/Zm/varjx?id=20&token=ea8289c5f5934720fb2ba5b4c7b50eb4&url=` +
        $text.URLEncode(webUrl);
      this.Http.get(url).then(resp => {
        $console.info(resp.data);
        const result = resp.data;
        if (result.code === "20") {
          resolve(result.msg);
        } else {
          reject(result);
        }
      });
    });
  }
  getWebContent(webUrl) {
    return new Promise((resolve, reject) => {
      try {
        if ($.hasString(webUrl)) {
          this.Http.get(webUrl).then(
            resp => {
              $console.info(resp.response);
              const data = resp.data,
                left = data.indexOf("window.__INITIAL_SSR_STATE__=") + 29,
                right = data.indexOf("</script>", left),
                json = data.substring(left, right),
                jsonData = JSON.parse(json);
              $console.info(jsonData);
            },
            fail => {
              $console.error(fail);
            }
          );
        } else {
          reject(undefined);
        }
      } catch (error) {
        $console.error(error);
        reject(undefined);
      }
    });
  }
}
class Xiaohongshu extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "xiaohongshu",
      modName: "小红书",
      version: "1",
      author: "zhihaofans",
      coreVersion: 12,
      useSqlite: false,
      allowWidget: false,
      allowApi: false
    });
  }
  run() {
    try {
      $input.text({
        type: $kbType.text,
        placeholder: "小红书链接",
        text: "",
        handler: link => {
          if ($.hasString(link)) {
            new XHSCore()
              .getNoteByUrl(link)
              .then(result => {
                if (result.code === 100) {
                  //                  $quicklook.open({
                  //                    list: result.data.pics
                  //                  });
                  if ($.hasString(result.data.playurl)) {
                    this.hasVideo({
                      videoUrl: result.data.playurl,
                      imageUrl: result.data.photo,
                      title: result.data.title
                    });
                  } else {
                    this.ApiManager.runApi({
                      apiId: "zhihaofans.viewer.open.image",
                      data: {
                        images: result.data.pics
                      }
                    })
                      .then(result => {})
                      .catch(fail => {
                        $console.error(fail);
                        $ui.error("runApi fail");
                      });
                  }
                } else {
                  $ui.alert({
                    title: "Hello",
                    message: JSON.stringify(result),
                    actions: [
                      {
                        title: "OK",
                        disabled: false, // Optional
                        handler: () => {}
                      },
                      {
                        title: "Cancel",
                        handler: () => {}
                      }
                    ]
                  });
                }
              })
              .then(fail => {
                $ui.error(fail.code);
              });
          }
        }
      });
    } catch (error) {
      $console.error(error);
    }
    //$ui.success("run");
  }
  hasVideo({ videoUrl, imageUrl, title }) {
    $ui.alert({
      title: "这本书有视频",
      message: "是否使用视频模式",
      actions: [
        {
          title: "打开视频模式",
          disabled: false, // Optional
          handler: () => {
            this.ApiManager.runApi({
              apiId: "zhihaofans.viewer.open.video",
              data: {
                video: videoUrl,
                image: imageUrl,
                title
              }
            })
              .then(result => {})
              .catch(fail => {
                $console.error(fail);
                $ui.error("runApi fail");
              });
          }
        },
        {
          title: "打开图片模式",
          handler: () => {
            this.ApiManager.runApi({
              apiId: "zhihaofans.viewer.open.image",
              data: {
                images: [imageUrl]
              }
            })
              .then(result => {})
              .catch(fail => {
                $console.error(fail);
                $ui.error("runApi fail");
              });
          }
        },
        {
          title: "取消",
          handler: () => {}
        }
      ]
    });
  }
  runB() {
    new XHSCore().getNote("");
  }
  runApi({ apiId, data, callback }) {
    $console.info({
      apiId,
      data,
      callback
    });
    switch (apiId) {
      case "example.ui":
        this.ModuleLoader.getModule("example.ui").initUi();

        break;
      default:
    }
  }
}
module.exports = Xiaohongshu;
