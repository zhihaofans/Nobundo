const { ModModule } = require("CoreJS"),
  HttpLib = require("HttpLib"),
  $ = require("$"),
  UA_PHONE =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  keychainList = {
    MXNZP_API_APPID: "mxnzp_api_appid",
    MXNZP_API_APPSECRET: "mxnzp_api_appsecret"
  };
class ResultView {
  constructor({ type, url, title, data }) {
    this.type = type;
    this.url = url;
    this.title = title;
    this.data = data;
  }
}
class XiaohongshuWebApi {
  constructor(mod) {
    this.ID = "xiaohongshu-web";
    this.TITLE = "小红书网页";
    this.Keychain = mod.Keychain;
  }
  match(url) {
    try {
      if (!$.hasString(this.Keychain.get(keychainList.MXNZP_API_APPID))) {
        this.Keychain.set(keychainList.MXNZP_API_APPID, "");
      }
      if (!$.hasString(this.Keychain.get(keychainList.MXNZP_API_APPSECRET))) {
        this.Keychain.set(keychainList.MXNZP_API_APPSECRET, "");
      }
    } catch (error) {
      $console.error(error);
    }
    const regList = [
      /^https?:\/\/xhslink\.com\/o\/[A-Za-z0-9]+$/,
      /^https?:\/\/www\.xiaohongshu\.com\/discovery\/item\/[a-f0-9]+(\?.*)?$/
    ];
    return regList.some(reg => reg.test(url));
  }
  parse(url) {
    return new Promise((resolve, reject) => {
      reject("未完成");
    });
  }
}
class XiaohongshuApi {
  constructor(mod) {
    this.ID = "xiaohongshu";
    this.TITLE = "小红书";
    this.Keychain = mod.Keychain;
  }
  match(url) {
    try {
      if (!$.hasString(this.Keychain.get(keychainList.MXNZP_API_APPID))) {
        this.Keychain.set(keychainList.MXNZP_API_APPID, "");
      }
      if (!$.hasString(this.Keychain.get(keychainList.MXNZP_API_APPSECRET))) {
        this.Keychain.set(keychainList.MXNZP_API_APPSECRET, "");
      }
    } catch (error) {
      $console.error(error);
    }
    const regList = [
      /^https?:\/\/xhslink\.com\/o\/[A-Za-z0-9]+$/,
      /^https?:\/\/www\.xiaohongshu\.com\/discovery\/item\/[a-f0-9]+(\?.*)?$/
    ];
    return regList.some(reg => reg.test(url));
  }
  parse(url) {
    return new Promise((resolve, reject) => {
      try {
        const appId = this.Keychain.get(keychainList.MXNZP_API_APPID),
          appSecret = this.Keychain.get(keychainList.MXNZP_API_APPSECRET),
          apiUrl = `https://www.mxnzp.com/api/xhs/video?url=${$text.base64Encode(
            url
          )}&app_id=${appId}&app_secret=${appSecret}`;
        $console.info("trystart");
        new HttpLib(apiUrl)
          .ua(UA_PHONE)
          .get()
          .then(resp => {
            if (resp.isError != false) {
              reject(resp.errorMessage || "未知错误");
            } else {
              try {
                const result = resp.data;
                if (result.code == 1) {
                  this.parseData(result.data);
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
      } catch (error) {
        $console.error(error);
        reject(error);
      }
    });
  }
  parseData(data) {
    const { title, type, cover, url, images } = data;
    if (type == "video") {
      $quicklook.open({
        url: url,
        handler: () => {
          // Handle dismiss action, optional
        }
      });
    } else {
      const imgList = images.map(i => i.url);
      $quicklook.open({
        list: imgList
      });
    }
  }
}

class ExampleModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "webparse.api",
      name: "网页解析Api",
      version: "1"
    });
    this.ModuleLoader = mod.ModuleLoader;
    this.API_LIST = [];
  }
  init() {
    try {
      this.API_LIST.push(new XiaohongshuApi(this.Mod));
      this.API_LIST.push(new XiaohongshuWebApi(this.Mod));
    } catch (error) {
      $console.error(error);
    } finally {
      $console.info("webparse.api.init");
    }
  }
  isMatch(url) {
    let match = false;
    try {
      this.API_LIST.some(item => {
        $console.info(item.ID);
        if (item.match(url)) {
          $console.info("true");
          match = true;
          return true; // 停止循环
        }
        $console.info("false");
        return false;
      });
      return match;
    } catch (error) {
      $console.error(error);
      return false;
    }
  }
  parse(url) {
    return new Promise((resolve, reject) => {
      try {
        const list = [];
        this.API_LIST.map(item => {
          if (item.match(url)) {
            list.push(item);
          }
        });
        resolve(list);
      } catch (error) {
        $console.error(error);
        reject(error.message);
      }
    });
  }
}
module.exports = ExampleModule;
