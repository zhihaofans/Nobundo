const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$"),
  { Http, Storage } = require("Next");
let APP_VERSION = "",
  APP_NAME = "";
class HttpExample {
  constructor() {
    this.Http = new Http(5);
    this.HEADER = {
      "User-Agent": `${APP_NAME}(${APP_VERSION})`,
      cookie: ""
    };
  }
  async get({ url, params }) {
    return await this.Http.get({
      url,
      params,
      header: this.HEADER
    });
  }
  getAsync({ url, params, callback }) {
    this.Http.getAsync({
      url,
      params,
      header: this.HEADER,
      handler: resp => {
        $console.info({
          resp
        });
        if (resp.error) {
          callback(undefined);
        } else {
          callback(resp.data);
        }
      }
    });
  }
  async post({ url, params, body }) {
    return await this.Http.post({
      url,
      params,
      body,
      header: this.HEADER
    });
  }
  postAsync({ url, params, body, callback }) {
    this.Http.getAsync({
      url,
      params,
      body,
      header: this.HEADER,
      handler: resp => {
        $console.info({
          resp
        });
        if (resp.error) {
          callback(undefined);
        } else {
          callback(resp.data);
        }
      }
    });
  }
}
class Search extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "search",
      modName: "搜索",
      version: "1",
      author: "zhihaofans",
      coreVersion: 13,
      useSqlite: false,
      allowWidget: false,
      allowApi: false,
      iconName: "command"
    });
    this.Storage = Storage;
    this.ModuleLoader = new ModuleLoader(this);
    this.ModuleLoader.addModule("search.music.js");
  }
  run() {
    try {
      const MusicSearch = this.ModuleLoader.getModule("search.music");
      $input.text({
        type: $kbType.text,
        placeholder: "",
        text: "",
        handler: keyword => {
          if (keyword) {
            MusicSearch.searchNetease(keyword);
          }
        }
      });
    } catch (error) {
      $console.error(error);
    }
    //$ui.success("run");
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
module.exports = Search;
