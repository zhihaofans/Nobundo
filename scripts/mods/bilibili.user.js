const { CoreModule } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class UserData {
  constructor(keychain) {
    this.Keychain = keychain;
  }
  cookie(newCookie) {
    const keychainId = "user.login.cookie";
    if (newCookie != undefined && Object.keys(newCookie).length > 0) {
      this.Keychain.set(keychainId, JSON.stringify(newCookie));
    }
    const nowCookie = this.Keychain.get(keychainId);
    return nowCookie ? JSON.parse(nowCookie) : undefined;
  }
  uid(uidStr) {
    const keychainId = "user.login.uid";
    if (uidStr != undefined && uidStr.length > 0) {
      this.Keychain.set(keychainId, uidStr);
    }
    return this.Keychain.get(keychainId);
  }
}

class UserLogin {
  constructor(core) {
    this.Http = core.Http;
    this.Data = new UserData(core.Keychain);
  }
  isLogin() {
    return this.Data.cookie().length > 0;
  }
  async getWebLoginKey() {
    const url = "https://passport.bilibili.com/qrcode/getLoginUrl",
      header = {},
      timeout = 5,
      res = await this.Http.get({
        url,
        header,
        timeout
      }),
      result = res.data;
    $console.warn({ res });
    if (result && result.status == true && result.code == 0) {
      const qrcodeData = result.data,
        //ts = result.ts,
        qrcodeUrl = qrcodeData.url,
        oauthKey = qrcodeData.oauthKey,
        qrcodeImage = $qrcode.encode(qrcodeUrl),
        obj = new Object();
      obj.url = qrcodeUrl;
      obj.oauthKey = oauthKey;
      obj.qrcode = qrcodeImage;
      return obj;
    }
    return undefined;
  }
  async loginByWebOauthkey(oauthkey) {
    if (oauthkey != undefined && oauthkey.length > 0) {
      const timeout = 5,
        url = `https://passport.bilibili.com/qrcode/getLoginInfo?oauthKey=${oauthkey}`,
        resp = await this.Http.post({
          url,
          timeout
        });
      if (resp.data) {
        const result = resp.data,
          response = resp.response;
        $console.info(result);
        if (result.status) {
          const scanTs = result.ts,
            setCookie = response.headers["Set-Cookie"];
          //DedeUserID
          const DedeUserID_left = setCookie.indexOf("DedeUserID=") + 11,
            DedeUserID_right = setCookie.indexOf(";", DedeUserID_left + 1),
            DedeUserID = setCookie.substring(DedeUserID_left, DedeUserID_right);
          //DedeUserID__ckMd5
          const DedeUserID__ckMd5_left =
              setCookie.indexOf("DedeUserID__ckMd5=") + 18,
            DedeUserID__ckMd5_right = setCookie.indexOf(
              ";",
              DedeUserID__ckMd5_left + 1
            ),
            DedeUserID__ckMd5 = setCookie.substring(
              DedeUserID__ckMd5_left,
              DedeUserID__ckMd5_right
            );
          //SESSDATA
          const SESSDATA_left = setCookie.indexOf("SESSDATA=") + 9,
            SESSDATA_right = setCookie.indexOf(";", SESSDATA_left + 1),
            SESSDATA = setCookie.substring(SESSDATA_left, SESSDATA_right);
          //bili_jct
          const bili_jct_left = setCookie.indexOf("bili_jct=") + 9,
            bili_jct_right = setCookie.indexOf(";", bili_jct_left + 1),
            bili_jct = setCookie.substring(bili_jct_left, bili_jct_right);
          //cookie
          const cookie = { DedeUserID, DedeUserID__ckMd5, SESSDATA, bili_jct },
            cookieSuccess = this.Data.cookie(cookie),
            uidSuccess = this.Data.uid(DedeUserID);
          $console.info({ scanTs, cookieSuccess, uidSuccess });
          if (cookieSuccess && uidSuccess && cookie != undefined) {
            $ui.success("登录成功，请返回");
          } else {
            $ui.error("登录失败，空白cookie");
          }
          return cookie;
        } else {
          $ui.error(result.message);
          return undefined;
        }
      }
    } else {
      return undefined;
    }
  }
}
class UserInfo {
  constructor(coreModule) {
    this.Module = coreModule;
    this.Http = coreModule.Core.Http;
    this.Data = new UserData(coreModule.Core.Keychain);
  }
  async AddToView(bvid) {
    const cookie = this.Module.getCookie(),
      postData = {},
      header = { cookie },
      url = "https://api.bilibili.com/x/v2/history/toview/add",
      timeout = 5,
      resp = await this.Core.$.http.post({
        url,
        header,
        timeout,
        body: postData
      }),
      response = resp.response;
    $console.info({ resp, header });
  }
  async getHistory() {
    $ui.loading(true);
    const url = "https://api.bilibili.com/x/web-interface/history/cursor?ps=30",
      header = { cookie: this.Data.cookie() },
      timeout = 5,
      resp = await this.Http.get({
        url,
        header,
        timeout
      });
    $console.info({ resp });
    if (resp.error) {
      $ui.loading(false);
      $ui.alert({
        title: "获取失败",
        message: resp.error.message,
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    } else {
      $ui.loading(false);
      const result = resp.data;
      if (result) {
        if (result.code == 0) {
          const data = result.data,
            historyList = data.list,
            listCount = historyList.length;
          if (listCount > 0) {
            $ui.push({
              props: {
                title: `共${listCount}个历史记录`
              },
              views: [
                {
                  type: "list",
                  props: {
                    autoRowHeight: true,
                    estimatedRowHeight: 44,
                    data: historyList.map(thisHistory => {
                      return {
                        title: `${thisHistory.author_mid}@${thisHistory.author_name}`,
                        rows: [
                          `av${thisHistory.history.oid} | ${thisHistory.history.bvid}`,
                          thisHistory.title
                        ]
                      };
                    })
                  },
                  layout: $layout.fill,
                  events: {
                    didSelect: (_sender, indexPath, _data) => {
                      const selectHistory = historyList[indexPath.section];
                      $ui.menu({
                        items: ["查看视频信息", "通过哔哩哔哩APP打开"],
                        handler: (title, idx) => {
                          switch (idx) {
                            case 0:
                              try {
                                this.Module.Core.ModuleLoader.getModule(
                                  "bilibili.video"
                                ).showVideoInfo(selectHistory.history.bvid);
                              } catch (error) {
                                $console.error(error);
                                $ui.error("Error");
                              }
                              break;
                            case 1:
                              //                              $app.openURL(selectHistory.short_link_v2);

                              break;
                            default:
                          }
                        }
                      });
                    }
                  }
                }
              ]
            });
          } else {
            $ui.error("空白历史记录");
          }
        } else {
          $ui.alert({
            title: `错误${result.code}`,
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
      } else {
        $ui.error("空白请求结果");
      }
    }
  }
  async getLaterToWatch() {
    $ui.loading(true);
    const url = "https://api.bilibili.com/x/v2/history/toview",
      header = { cookie: this.Data.cookie() },
      timeout = 5,
      resp = await this.Http.get({
        url,
        header,
        timeout
      });
    $console.info({ resp });
    if (resp.error) {
      $ui.loading(false);
      $ui.alert({
        title: "获取失败",
        message: resp.error.message,
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    } else {
      $ui.loading(false);
      const result = resp.data;
      if (result) {
        if (result.code == 0) {
          const data = result.data,
            listCount = data.count,
            later2watchList = data.list;
          if (listCount > 0) {
            $ui.push({
              props: {
                title: `稍后再看共${listCount}个视频`
              },
              views: [
                {
                  type: "list",
                  props: {
                    autoRowHeight: true,
                    estimatedRowHeight: 44,
                    data: later2watchList.map(thisVideo => {
                      return {
                        title: `${thisVideo.owner.mid}@${thisVideo.owner.name}`,
                        rows: [
                          `av${thisVideo.aid} | ${thisVideo.bvid}`,
                          thisVideo.title
                        ]
                      };
                    })
                  },
                  layout: $layout.fill,
                  events: {
                    didSelect: (_sender, indexPath, _data) => {
                      const selectVideo = later2watchList[indexPath.section];
                      $ui.menu({
                        items: ["查看视频信息", "通过哔哩哔哩APP打开"],
                        handler: (title, idx) => {
                          switch (idx) {
                            case 0:
                              try {
                                this.Module.Core.ModuleLoader.getModule(
                                  "bilibili.video"
                                ).showVideoInfo(selectVideo.bvid);
                              } catch (error) {
                                $console.error(error);
                                $ui.error("Error");
                              }
                              break;
                            case 1:
                              $app.openURL(selectVideo.short_link_v2);

                              break;
                            default:
                          }
                        }
                      });
                    }
                  }
                }
              ]
            });
          } else {
            $ui.error("请添加视频");
          }
        } else {
          $ui.alert({
            title: `错误${result.code}`,
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
      } else {
        $ui.error("空白请求结果");
      }
    }
  }
  async getUserInfo() {
    const cookie = this.Module.getCookie(),
      header = { cookie },
      url = "https://api.bilibili.com/x/web-interface/nav",
      timeout = 5,
      resp = await this.Core.$.http.get({
        url,
        header,
        timeout
      }),
      response = resp.response;
    $console.info({ resp, header });
  }
}

class Vip {
  constructor(coreModule) {
    this.Module = coreModule;
    this.Core = coreModule.Core;
  }
  async getPrivilegeStatus(listItem) {
    listItem.startLoading({
      color: $color("#FF0000")
    });
    const cookie = this.Module.getCookie(),
      header = { cookie },
      url = "https://api.bilibili.com/x/vip/privilege/my",
      timeout = 5,
      resp = await this.Core.$.http.get({
        url,
        header,
        timeout
      }),
      response = resp.response;
    $console.info({ resp, header });
    listItem.stopLoading();
    if (resp.error) {
      $ui.alert({
        title: `请求错误(${response.code})`,
        message: resp.error.localizedDescription,
        actions: [
          {
            title: "OK",
            disabled: false,
            handler: () => {}
          }
        ]
      });
    } else {
      const result = resp.data;
      if (result.code == 0) {
        const privilegeList = result.data.list,
          privilegeStr = { 1: "B币", 2: "会员购优惠券", 3: "漫画福利券" };
        $ui.push({
          props: {
            title: this.TITLE
          },
          views: [
            {
              type: "list",
              props: {
                data: privilegeList.map(privilege => {
                  const privilegeStatus =
                      privilege.state == 1 ? "(已领取)" : "(未领取)",
                    privilegeTitle = privilegeStr[privilege.type] || "未知";
                  return privilegeTitle + privilegeStatus;
                })
              },
              layout: $layout.fill,
              events: {
                didSelect: (sender, indexPath, _data) => {
                  const clickItem = sender.cell(indexPath);
                  clickItem.startLoading({
                    color: $color("#FF0000")
                  });
                  const thisPrivilege = privilegeList[indexPath.row];
                  if (thisPrivilege.state == 1) {
                    clickItem.stopLoading();
                    $ui.alert({
                      title: "领取失败",
                      message: privilegeStr[thisPrivilege.type] + "已领取",
                      actions: [
                        {
                          title: "OK",
                          disabled: false, // Optional
                          handler: () => {}
                        }
                      ]
                    });
                  } else {
                    this.receivePrivilege(thisPrivilege.type, clickItem);
                  }
                }
              }
            }
          ]
        });
      } else {
        $ui.alert({
          title: `请求失败(${result.code})`,
          message: result.message,
          actions: [
            {
              title: "OK",
              disabled: false,
              handler: () => {}
            }
          ]
        });
      }
    }
  }
  async receivePrivilege(typeId, clickItem) {
    const cookie = this.Module.getCookie(),
      header = { cookie },
      bili_jct = cookie.bili_jct,
      url = `https://api.bilibili.com/x/vip/privilege/receive?type=${typeId}&csrf=${bili_jct}`,
      timeout = 5,
      resp = await this.Core.$.http.post({
        url,
        header,
        timeout
      }),
      result = resp.data,
      resultCodeList = {
        "-101": "账号未登录",
        "-111": "csrf 校验失败",
        "-400": "请求错误",
        "69800": "网络繁忙 请稍后再试",
        "69801": "你已领取过该权益",
        "0": "成功"
      },
      message = resultCodeList[result.code];
    clickItem.stopLoading();
    $console.info({ resp, message });
  }
}

class BilibiliUser extends CoreModule {
  constructor(core) {
    super({
      coreId: "bilibili",
      moduleId: "bilibili.user",
      moduleName: "哔哩哔哩用户模块",
      version: "1"
      //author: "zhihaofans"
    });
    this.Core = core;
    this.Login = new UserLogin(core);
    this.Info = new UserInfo(this);
    this.Vip = new Vip(this);
  }
  getCookie() {
    return this.Login.Data.cookie();
  }
  isLogin() {
    return this.Login.isLogin();
  }
  async login(listItem) {
    listItem.startLoading({
      color: $color("#FF0000")
    });
    const loginKey = await this.Login.getWebLoginKey(),
      lisiItem = ["查看二维码", "已扫二维码"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            $quicklook.open({
              image: loginKey.qrcode
            });
            break;
          case 1:
            this.Login.loginByWebOauthkey(loginKey.oauthKey);
            break;
        }
      };
    $console.warn({
      loginKey
    });
    listItem.stopLoading();
    listKit.pushString("二维码登录", lisiItem, didSelect);
  }
}
module.exports = BilibiliUser;
