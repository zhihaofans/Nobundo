const LOGO =
  "https://avatars.githubusercontent.com/u/119824398?s=400&u=4c264991cdb000efa9b47019fc45b0de58f66539&v=4";
const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$"),
  { Http, Storage } = require("Next");
let APP_VERSION = "0.0.1",
  APP_NAME = "tikhub-api";
class HttpCore {
  constructor(apiToken) {
    this.Http = new Http(5);
    this.HEADER = {
      "User-Agent": `${APP_NAME}(${APP_VERSION})`,
      "Content-Type": "application/x-www-form-urlencoded",
      cookie: `Authorization=${apiToken}`
    };
  }
  setApiToken(apiToken) {
    this.HEADER.cookie = `Authorization=${apiToken}`;
  }
  getThen(url, params) {
    return this.Http.get({
      url,
      params,
      header: this.HEADER
    });
  }
  postThen(url, body, params) {
    return this.Http.post({
      url,
      body,
      params,
      header: this.HEADER
    });
  }
}
class TikHubApi {
  constructor(apiToken) {
    this.Http = new HttpCore(apiToken);
    this.API_HOST = "https://api.tikhub.io/";
  }
  login(username, password) {
    const tokenMinutes = 30 * 24 * 60,
      deadTime = $.getTimestamp() + tokenMinutes * 60 * 1000;
    return new Promise((resolve, reject) => {
      const params = {
          token_expiry_minutes: tokenMinutes,
          keep_login: true
        },
        body = {
          username,
          password
        };
      this.Http.postThen(this.API_HOST + "user/login", body, params)
        .then(resp => {
          $console.info(resp);
          const { statusCode } = resp.response;
          const result = resp.data,
            detail = result.detail;
          $console.info(statusCode);
          if ($.isString(detail)) {
            reject({
              success: false,
              message: detail
            });
          } else if (result === undefined || result === null) {
            reject({
              success: false,
              message: "result=null"
            });
          } else if (result.status === true) {
            if ($.hasString(result.access_token)) {
              this.Http.setApiToken(result.access_token);
            }
            resolve({
              success: true,
              message: result.message_cn || "success",
              api_token: result.access_token,
              deadTime: deadTime || 0
            });
          } else {
            if ($.hasString(result.access_token)) {
              this.Http.setApiToken(result.access_token);
            }
            resolve({
              success: status === true || detail.status === true,
              message: detail.message_cn || "success"
            });
          }
        })
        .catch(fail => {
          $console.error(fail);
          reject({
            success: false,
            message: fail.message || "catch.fail"
          });
        });
    });
  }
  dailyCheckin() {
    return new Promise((resolve, reject) => {
      this.Http.getThen(this.API_HOST + "promotion/daily_check_in")
        .then(resp => {
          $console.info(resp);
          const { statusCode } = resp.response;
          const result = resp.data;
          $console.info(statusCode);
          if (statusCode === 200) {
            resolve({
              success: result.status === true,
              message: result.message
            });
          } else {
            reject({
              success: false,
              code: statusCode,
              message: result.message || `Http code:${statusCode}`
            });
          }
        })
        .catch(fail => {
          $console.error(fail);
          reject({
            success: false,
            message: fail.message || "fail"
          });
        });
    });
  }
  xhsGetNoteData(url) {
    return new Promise((resolve, reject) => {
      if ($.hasString(url)) {
        this.Http.getThen(this.API_HOST + "xhs/get_note_data/", {
          url: $text.URLEncode(url)
        })
          .then(resp => {
            $console.info(resp);
            const { statusCode } = resp.response;
            const result = resp.data;
            $console.info(statusCode);
            if (statusCode === 200) {
              resolve({
                success: result.status === true,
                message: result.message
              });
            } else {
              reject({
                success: false,
                code: statusCode,
                message: result.message || `Http code:${statusCode}`
              });
            }
          })
          .catch(fail => {
            $console.error(fail);
            reject({
              success: false,
              message: fail.message || "fail"
            });
          });
      } else {
        reject({
          success: false,
          message: "need url"
        });
      }
    });
  }
  reloadApiToken(newApiToken) {
    this.Http = new HttpCore(newApiToken);
  }
}
class TikHubCore {
  constructor(sqlite) {
    this.SQL_KEY = {
      API_TOKEN: "api_token",
      API_TOKEN_EXPIRED: "api_token_expired",
      USERNAME: "username"
    };
    this.SQLITE = sqlite;
  }
  hasTable() {
    return this.SQLITE.hasTable() === true;
  }
  getApiToken() {
    return this.SQLITE.getItem(this.SQL_KEY.API_TOKEN);
  }
  setApiToken(token) {
    return this.SQLITE.setItem(this.SQL_KEY.API_TOKEN, token);
  }
  removeApiToken() {
    return this.SQLITE.deleteItem(this.SQL_KEY.API_TOKEN);
  }
  getApiTokenExpired() {
    return this.SQLITE.getItem(this.SQL_KEY.API_TOKEN_EXPIRED).toInt() || 0;
  }
  setApiTokenExpired(time) {
    if ($.isNumber(time) && time > 0) {
      return this.SQLITE.setItem(
        this.SQL_KEY.API_TOKEN_EXPIRED,
        time.toString()
      );
    } else {
      $console.error({
        setApiTokenExpired: time,
        message: "time is not number or time<=0"
      });
      return false;
    }
  }
  getUserName() {
    return this.SQLITE.getItem(this.SQL_KEY.USERNAME);
  }
  setUserName(username) {
    return this.SQLITE.setItem(this.SQL_KEY.USERNAME, username);
  }
}
class TikHubView {
  constructor(mod) {
    this.Core = new TikHubCore(mod.SQLITE);
    this.Api = new TikHubApi(this.Core.getApiToken());
    const XHS = mod.ModuleLoader.getModule("tikhub.xhs");
  }
  login() {
    $input.text({
      type: $kbType.text,
      placeholder: "账号",
      text: this.Core.getUserName() || "",
      handler: username => {
        if ($.hasString(username)) {
          $input.text({
            type: $kbType.password,
            placeholder: "",
            text: "",
            handler: pw => {
              if ($.hasString(pw)) {
                $.startLoading();
                this.Api.login(username, pw)
                  .then(result => {
                    $.stopLoading();
                    if (result.success === true) {
                      const apiToken = result.api_token,
                        deadTime = result.deadTime;
                      this.Core.setUserName(username);
                      if ($.hasString(apiToken)) {
                        const setTokenSu = this.Core.setApiToken(apiToken);
                        if (setTokenSu === true) {
                          this.Api.reloadApiToken(apiToken);
                          this.Core.setApiTokenExpired(deadTime);

                          this.initView();
                          $ui.success("登录成功");
                        } else {
                          $ui.error("保存ApiToken失败");
                        }
                      } else {
                        $ui.alert({
                          title: "登录成功",
                          message: "但是得到的Api Token为空",
                          actions: [
                            {
                              title: "OK",
                              disabled: false, // Optional
                              handler: () => {}
                            }
                          ]
                        });
                      }
                    } else {
                      $ui.alert({
                        title: "登录失败",
                        message: result.message,
                        actions: [
                          {
                            title: "OK",
                            disabled: false, // Optional
                            handler: () => {}
                          },
                          {
                            title: "Cancel",
                            handler: () => {}
                          }
                        ]
                      });
                    }
                  })
                  .catch(fail => {
                    $.stopLoading();
                    $ui.alert({
                      title: "login.fail",
                      message: fail.message,
                      actions: [
                        {
                          title: "OK",
                          disabled: false, // Optional
                          handler: () => {}
                        },
                        {
                          title: "Cancel",
                          handler: () => {}
                        }
                      ]
                    });
                  });
              } else {
                $ui.error("请输入密码");
              }
            }
          });
        } else {
          $ui.error("请输入账号");
        }
      }
    });
  }
  init() {
    if (this.Core.hasTable()) {
      if (!$.hasString(this.Core.getApiToken())) {
        this.Core.removeApiToken();
        this.login();
      } else {
        this.initView();
      }
    } else {
      $ui.error("数据库未初始化");
    }
  }
  initView() {
    $ui.push({
      props: {
        title: "TikHub"
      },
      views: [
        {
          type: "list",
          props: {
            data: ["每日签到", "xhs"]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const { section, row } = indexPath;
              switch (row) {
                case 0:
                  this.dailyCheckin();
                  break;
                  case 1:
                  this.getXhs()
                  break
                default:
              }
            }
          }
        }
      ]
    });
  }
  dailyCheckin() {
    $.startLoading();
    this.Api.dailyCheckin()
      .then(result => {
        $.stopLoading();
        $console.info(result);
        if (result.success) {
          $ui.alert({
            title: "签到成功",
            message: result.message,
            actions: [
              {
                title: "OK",
                disabled: false, // Optional
                handler: () => {}
              }
            ]
          });
        } else {
          $ui.alert({
            title: "签到失败",
            message: result.message,
            actions: [
              {
                title: "OK",
                disabled: false, // Optional
                handler: () => {}
              }
            ]
          });
        }
      })
      .catch(fail => {
        $.stopLoading();
        $ui.alert({
          title: "签到错误",
          message: fail.message,
          actions: [
            {
              title: "OK",
              disabled: false, // Optional
              handler: () => {
                if (fail.code === 401) {
                  this.loginExpired();
                }
              }
            },
            {
              title: "Cancel",
              handler: () => {}
            }
          ]
        });
      });
  }
  getXhs() {
    $input.text({
      type: $kbType.url,
      placeholder: "/www.xiaohongshu.com/explore/****",
      text: "",
      handler: url => {
        $.startLoading();
        if ($.isLink(url)) {
          this.Api.xhsGetNoteData(url)
            .then(result => {})
            .catch(fail => {
              $.stopLoading();
              $ui.alert({
                title: "获取失败",
                message: fail.message,
                actions: [
                  {
                    title: "OK",
                    disabled: false, // Optional
                    handler: () => {
                      if (fail.code === 401) {
                        this.loginExpired();
                      }
                    }
                  }
                ]
              });
            });
        } else {
          $ui.error("请输入小红书链接");
        }
      }
    });
  }
  loginExpired() {
    this.Core.removeApiToken();
    this.login();
  }
}
class TikHub extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "tikhub",
      modName: "TikHub",
      version: "1",
      author: "zhihaofans",
      coreVersion: 13,
      useSqlite: true,
      allowWidget: false,
      allowApi: true,
      icon: LOGO
    });
    //    APP_VERSION = app.AppInfo.version;
    //    APP_NAME = app.AppInfo.name;
    this.ModuleLoader = new ModuleLoader(this);
        this.ModuleLoader.addModule("tikhub.xhs.js");
  }
  run() {
    try {
      //this.runSqlite();
      new TikHubView(this).init();
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
module.exports = TikHub;
