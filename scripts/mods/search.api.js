const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  $ = require("$"),
  ListViewKit = new Next.ListView();

class Api {
  constructor(mod) {
    this.SITE = {
      douyin: {
        title: "抖音",
        type: "url",
        func: keyword =>
          `snssdk1128://search?keyword=${$text.URLEncode(keyword)}`
      },
      bilibili: {
        title: "B站",
        type: "url",
        func: keyword =>
          `bilibili://search/?keyword=${$text.URLEncode(keyword)}`
      },
      twitter_x: {
        title: "Χ",
        type: "url",
        func: keyword =>
          `https://mobile.x.com/search?q=${$text.URLEncode(keyword)}`
      },
      instgram: {
        title: "Instagram",
        type: "url",
        func: keyword =>
          `https://www.instagram.com/explore/tags/${$text.URLEncode(keyword)}`
      },
      instgram: {
        title: "📕",
        type: "url",
        func: keyword =>
          `xhsdiscover://search/result?keyword=${$text.URLEncode(keyword)}`
      }
    };
  }
  search(id, keyword) {
    return new Promise((resolve, reject) => {
      if ($.isEmpty(id)) {
        reject("id isEmpty");
      } else if ($.isEmpty(keyword)) {
        reject("keyword isEmpty");
      } else {
        const site = this.SITE[id];
        if (site == undefined) {
          reject(`no site: ${id}`);
        } else {
          $console.warn(site);
          try {
            switch (site.type) {
              case "url":
                $app.openURL(site.func(keyword));
                resolve();

                break;
              default:
                reject(`type: ${site.type}`);
            }
          } catch (error) {
            $console.error(error);
            reject(`search.catch(${error.line}):${error.message}`);
          } finally {
            $console.info(`search.finally(${id}):${keyword}`);
          }
        }
      }
    });
  }
}
class SearchApi extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "search.api",
      name: "搜索插件",
      version: "1"
      //author: "zhihaofans"
    });
    //this.Mod = mod;
    this.Api = new Api(mod);
  }
  getApiList() {
    return this.Api.SITE;
  }
  search(id, keyword) {
    return this.Api.search(id, keyword);
  }
}
module.exports = SearchApi;
