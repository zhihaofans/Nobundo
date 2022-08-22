const { ModCore } = require("../../Core.js/core");
class SearchEngineCore {
  constructor({ id, name }) {
    this.ID = id;
    this.NAME = name;
  }
  run(keyword) {
    return keyword;
  }
  getSearchResult(keyword) {
    return {
      success: true,
      count: 1,
      data: [keyword],
      message: "example"
    };
  }
}
class BaiduSearch extends SearchEngineCore {
  constructor() {
    super({
      id: "baidu",
      name: "百度一下"
    });
  }
  run(keyword) {
    $safari.open({
      url: `https://www.baidu.com/s?wd=${keyword}`,
      entersReader: true,
      height: 360,
      handler: () => {}
    });
  }
}

class SearchCore {
  constructor(name) {
    this.NAME = name;
  }
}

class SearchUi {
  constructor(mod) {
    this.Mod = mod;
  }
  test() {
    $ui.progress(0.5, "下载中...");
  }
  init() {
    $input.text({
      type: $kbType.text,
      placeholder: "搜索的关键词",
      text: "",
      handler: keyword => {}
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
      coreVersion: 7,
      useSqlite: false
    });
  }
  run() {
    //$ui.success("run");
    const searchUi = new SearchUi(this);
    searchUi.test();
  }

  runApi({ url, data, callback }) {
    //TODO:允许其他Mod调用
    this.allowApi = false;
    return undefined;
  }
}
module.exports = Search;
