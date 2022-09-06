const { ModCore } = require("CoreJS"),
  $ = require("$"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class Main {
  constructor(mod) {
    this.Mod = mod;
    this.Http = mod.Http;
    this.keychainId = {
      apiKey: "apikey",
      nextseed: "nextseed"
    };
  }
  init() {
    try {
      $ui.menu({
        items: ["设置api key", "随机动漫"],
        handler: (title, idx) => {
          switch (idx) {
            case 0:
              this.setApikey();
              break;
            case 1:
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
  setApikey() {
    //TODO
    $ui.error("TODO");
  }
  async random(categories = "111") {
    $ui.loading(true);
    const nextSeedId = this.keychainId.needseed,
      query = `id%3A5type:png`,
      sorting = `random`,
      randomSeed = this.Mod.Keychain.get(this.keychainId.needseed) || `XekqJ6`,
      page = 1,
      purity = "111",
      api_key = this.Mod.Keychain.get(this.keychainId.apiKey) || "",
      url = `https://wallhaven.cc/api/v1/search?q=${query}&sorting=${sorting}&seed=${randomSeed}&page=${page}&purity=${purity}&categories=${categories}&apikey=${api_key}`,
      httpResult = await this.Http.get({ url });
    $console.warn({
      httpResult
    });
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
      this.Mod.Keychain.set(
        this.keychainId.needseed,
        nextRandomSeed || randomSeed
      );
      $ui.loading(false);
      $console.info(httpData);
      $console.warn(apiData);
      if (apiData.length > 0) {
        const didSelect = (sender, indexPath, data) => {
          $ui.preview({
            title: "URL",
            url: apiData[indexPath.row].path
          });
        };
        listKit.pushString(
          `${apiData.length}张`,
          apiData.map(img => img.id),
          didSelect
        );
      } else {
        $ui.toast("空白");
      }
    }
  }
  animeRandom() {
    this.random("010");
  }
}

class Wallhaven extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "wallhaven",
      modName: "Wallhaven",
      version: "1b",
      author: "zhihaofans",
      coreVersion: 9
    });
    this.$ = $;
    this.Http = $.http;
  }
  run() {
    const main = new Main(this);
    main.init();
  }
}
module.exports = Wallhaven;
