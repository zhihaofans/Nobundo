const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(core) {
    this.Core = core;
    this.Kernel = core.kernel;
    this.Http = new core.Http(5);
  }
  init() {
    try {
      $ui.menu({
        items: ["随机"],
        handler: (title, idx) => {
          switch (idx) {
            case 0:
              this.animeRandom();
              break;
          }
        }
      });
    } catch (_ERROR) {
      $console.error(_ERROR);
      $ui.alert({
        title: "wallhaven.init",
        message: _ERROR.message
      });
      $ui.loading(false);
    }
  }
  async animeRandom() {
    $ui.loading(true);
    const next_seed_id = "nextseed",
      query = `id%3A5type:png`,
      sorting = `random`,
      randomSeed = this.Keychain.get(next_seed_id) || `XekqJ6`,
      page = 1,
      purity = "111",
      categories = "010",
      api_key = this.Keychain.get("api_key") || "",
      url = `https://wallhaven.cc/api/v1/search?q=${query}&sorting=${sorting}&seed=${randomSeed}&page=${page}&purity=${purity}&categories=${categories}&apikey=${api_key}`,
      httpResult = await this.http.get(url);
    if (httpResult.error) {
      $console.error(httpResult.error);
      $ui.loading(false);
      $ui.alert({
        title: "mod.wallhaven.error",
        message: httpResult.error.message
      });
    } else if (httpResult.data) {
      const httpData = httpResult.data,
        apiData = httpData.data,
        apiMeta = httpData.meta,
        nextRandomSeed = apiMeta.seed;
      $console.info(`nextRandomSeed:${nextRandomSeed}`);
      this.Keychain.set(next_seed_id, nextRandomSeed || randomSeed);
      $ui.loading(false);
      $console.info(httpData);
    }
  }
}

class Wallhaven extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      modName: "Wallhaven",
      version: "1",
      author: "zhihaofans",
      needCoreVersion: 2,
      keychainId: "wallhaven"
    });
  }
  run() {
    const main = new Main(this);
    main.init();
  }
}
module.exports = Wallhaven;
