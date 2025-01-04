const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$"),
  { Http, Storage } = require("Next");
class HttpExample {
  constructor() {
    this.Http = new Http(5);
    this.HEADER = {
      "User-Agent": `APP_NAME(APP_VERSION)`,
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
  getThen({ url, params }) {
    return this.Http.get({
      url,
      params,
      header: this.HEADER
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
  postThen({ url, params, body }) {
    return this.Http.post({
      url,
      params,
      body,
      header: this.HEADER
    });
  }
}
class YPP {
  constructor() {
    this.Init = false;
    this.Cityid = "";
    this.Longitude = ""; //经度
    this.Latitude = ""; //纬度
    this.API_HOST = "https://apicore.youpiaopiao.cn/";
    this.Http = new Http(5);
  }
  init(loc, cityId) {
    this.Cityid = cityId;
    this.Longitude = loc.lng;
    this.Latitude = loc.lat;
    this.Init = true;
  }
  searchKfcShop() {
    return new Promise((resolve, reject) => {
      const url =
        this.API_HOST +
        `api/kfc/shops2?cityId=${this.Cityid}&lat=${this.Latitude}&lon=${this.Longitude}&pid=16`;
      this.Http.get({
        url
        //params,
        //header: this.HEADER
      }).then(resp => {});
    });
  }
  getCityData() {
    return new Promise((resolve, reject) => {
      const url = this.API_HOST + "movies/get_citys";
      this.Http.get({
        url
        //params,
        //header: this.HEADER
      }).then(resp => {
        const result=resp.data
       if(result!=undefined&&result.code===0){
         const cityData=result.data
         
       }else{
         reject(resp)
       }
      });
    });
  }
}
class Example extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "life",
      modName: "生活",
      version: "1",
      author: "zhihaofans",
      coreVersion: 13,
      useSqlite: false,
      allowWidget: false,
      allowApi: false,
      iconName: "command"
    });
    this.YPP = new YPP();
  }
  init() {
    $location.fetch({
      handler: loc => {
        const { lat, lng, alt } = loc;
        this.YPP.init(loc);
      }
    });
  }
  run() {
    try {
      if ($location.available) {
        this.init()
      } else {
        $ui.alert({
          title: "初始化失败",
          message: "没有定位权限",
          actions: [
            {
              title: "OK",
              disabled: false, // Optional
              handler: () => {}
            }
          ]
        });
      }
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
