const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$"),
  { Http, Storage } = require("Next");
class HttpExample {
  constructor() {
    this.Http = new Http(5);
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
class GithubCore {
  constructor() {
    this.regExpList = [
      {
        reg: /https?:\/\/raw.githubusercontent.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)/,
        owner: 1,
        resp: 2,
        version: 3,
        path: 4
      },
      {
        reg: /https:\/\/github.com\/([^/]+)\/([^/]+)\/(blob|tree)\/([^/]+)\/(.+)/,
        owner: 1,
        resp: 2,
        version: 4,
        path: 5
      }
    ];
  }
  getCdnUrl({ owner, resp, version = "master", path }) {
    $console.info({
      owner,
      resp,
      version,
      path
    });
    if (owner && resp && version && path) {
      return `https://cdn.jsdelivr.net/gh/${owner}/${resp}@${version}/${path}`;
    } else {
      return undefined;
    }
  }
  parseUrl(url) {
    let data = undefined;
    for (let i = 0; i < this.regExpList.length; i++) {
      const thisReg = this.regExpList[i],
        match = url.match(thisReg.reg);
      if (match) {
        data = {
          owner: match[thisReg.owner],
          resp: match[thisReg.resp],
          version: match[thisReg.version],
          path: match[thisReg.path]
        };
      }
    }
    return data;
  }
}
class JsDelivr extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "jsdelivr",
      modName: "jsDelivr",
      version: "1",
      author: "zhihaofans",
      coreVersion: 13,
      useSqlite: false,
      allowWidget: false,
      allowApi: false
    });
  }
  run() {
    const githubCore = new GithubCore();
    $input.text({
      type: $kbType.text,
      placeholder: "",
      text:
        "https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/fav/list.md",
      handler: text => {
        if (text) {
          const result = githubCore.parseUrl(text);
          $console.info(result);
          if (result) {
            $input.text({
              type: $kbType.text,
              placeholder: "",
              text: githubCore.getCdnUrl(result),
              handler: textA => {}
            });
          }
        }
      }
    });
  }
}
module.exports = JsDelivr;
