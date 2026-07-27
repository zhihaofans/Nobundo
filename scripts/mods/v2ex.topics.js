const { ModModule } = require("CoreJS"),
  HttpLib = require("HttpLib"),
  $ = require("$");
class TopicsCore {
  constructor() {
    this.API_HOST = "https://www.v2ex.com/";
  }
  getApi(apiUrl) {
    return new Promise((resolve, reject) => {
      new HttpLib(apiUrl)
        //.ua(UA_PHONE)
        .get()
        .then(resp => {
          $console.info(resp);
          if (resp.isError != false) {
            reject(resp.errorMessage || "#未知错误");
          } else {
            try {
              const result = resp.data;
              if (result.code == 1) {
                resolve(result.data);
              } else {
                reject(result);
              }
            } catch (error) {
              $console.error(error);
              reject(error.message);
            }
          }
        })
        .catch(fail => reject(fail));
      $console.info("try");
    });
  }
  getHotList() {
    const url = this.API_HOST + "api/topics/hot.json";
    this.getApi(url);
  }
}

class BiliModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "v2ex.topics",
      name: "V2EX话题",
      version: "1"
    });
    this.Topics = new TopicsCore();
  }
  getHotList() {
    this.Topics.getHotList()
  }
}
module.exports = BiliModule;
