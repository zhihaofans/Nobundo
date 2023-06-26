const { ModCore } = require("CoreJS"),
  $ = require("$"),
  Next = require("Next"),
  ListView = new Next.ListView();
class Main {
  constructor(mod) {
    this.Mod = mod;
    this.Http = new Next.Http(5);
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
  goRandom(categories = "111") {
    return new Promise((resolve, reject) => {
      $.startLoading();
      const query = `id%3A5type:png`,
        sorting = `random`,
        randomSeed =
          this.Mod.Keychain.get(this.keychainId.nextseed) || `XekqJ6`,
        page = 1,
        purity = "111",
        api_key = this.Mod.Keychain.get(this.keychainId.apiKey) || "",
        url = `https://wallhaven.cc/api/v1/search?q=${query}&sorting=${sorting}&seed=${randomSeed}&page=${page}&purity=${purity}&categories=${categories}&apikey=${api_key}`;
      this.Http.getThen({
        url
      })
        .then(resp => {
          const httpData = resp.data,
            apiData = httpData.data,
            apiMeta = httpData.meta,
            nextRandomSeed = apiMeta.seed;
          $console.info(`nextRandomSeed:${nextRandomSeed}`);
          this.Mod.Keychain.set(
            this.keychainId.needseed,
            nextRandomSeed || randomSeed
          );
          $.stopLoading();
          $.info(httpData);
          $.warn(apiData);
          if (apiData.length > 0) {
            this.Mod.ApiManager.runApi({
              apiId: "zhihaofans.viewer.open.image",
              data: {
                images: apiData.map(img => img.path),
                thumbs: apiData.map(img => img.thumbs.small)
              }
            })
              .then(result => {})
              .catch(fail => {
                $console.error(fail);
                $ui.error("runApi fail");
              });
          } else {
            $ui.toast("空白");
          }
        })
        .catch(fail => {
          $console.error(fail);
          $.stopLoading();
          $ui.alert({
            title: "mod.wallhaven.error",
            message: fail.message
          });
        });
    });
  }
  animeRandom() {
    this.goRandom("010");
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
      coreVersion: 12
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
