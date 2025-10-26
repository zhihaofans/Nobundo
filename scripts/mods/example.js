const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$"),
  HttpLib = require("HttpLib"),
  { Http, Storage } = require("Next");
let APP_VERSION = "",
  APP_NAME = "";
class HttpExample {
  constructor() {
    this.Http = new HttpLib();
    this.HEADER = {
      "User-Agent": `${APP_NAME}(${APP_VERSION})`,
      cookie: ""
    };
    this.Http.header(this.HEADER);
  }
  get({ url, params }) {
    this.Http.url(url);
    this.Http.params(params);
    return this.Http.get();
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
  postThen({ url, params, body }) {
    return this.Http.post({
      url,
      params,
      body,
      header: this.HEADER
    });
  }
}
class Example extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "example",
      modName: "例子",
      version: "11",
      author: "zhihaofans",
      coreVersion: 18,
      useSqlite: true,
      allowWidget: true,
      allowApi: true,
      iconName: "command"
    });
    this.Storage = Storage;
    this.ModuleLoader = new ModuleLoader(this);
    this.ModuleLoader.addModule("example.ui.js");
    APP_VERSION = app.AppInfo.version;
    APP_NAME = app.AppInfo.name;
  }
  run() {
    try {
      this.runSqlite();
      const ui = this.ModuleLoader.getModule("example.ui");
      ui.initUi();
    } catch (error) {
      $console.error(error);
    }
    //$ui.success("run");
  }
  runWidget(widgetId) {
    $widget.setTimeline({
      render: ctx => {
        return {
          type: "text",
          props: {
            text: widgetId || "Hello!"
          }
        };
      }
    });
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
  runSqlite() {
    const sqlite_key = "last_run_timestamp",
      lastRunTimestamp = this.SQLITE.getItem(sqlite_key);

    this.SQLITE.setItem(sqlite_key, new Date().getTime().toString());
    $console.info({
      mod: this.MOD_INFO,
      lastRunTimestamp
    });
  }
}
module.exports = Example;
