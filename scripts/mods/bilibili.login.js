const { ModModule } = require("CoreJS"),
  HttpLib = require("HttpLib"),
  $ = require("$");
class ImageView {
  constructor() {}
  showImageAndButton({
    title,
    imageUrl,
    imageData,
    buttonTitle,
    buttonTapped
  }) {
    $.showView({
      props: {
        title
      },
      views: [
        {
          type: "image",
          props: {
            src: imageUrl,
            image: imageData,
            contentMode: $contentMode.scaleAspectFit
          },
          layout: (make, view) => {
            make.top.left.right.equalTo(view.super);
            make.height.equalTo(view.width);
          }
        },
        {
          type: "button",
          props: {
            title: buttonTitle,
            bgcolor: $color("#007AFF"),
            titleColor: $color("white")
          },
          layout: (make, view) => {
            make.centerX.equalTo(view.super);
            make.top.equalTo(view.prev.bottom).offset(20);
            make.size.equalTo($size(100, 40));
          },
          events: {
            tapped: sender => {
              buttonTapped(sender);
            }
          }
        }
      ]
    });
  }
  showImageAndTwoButton({
    title,
    imageUrl,
    imageData,
    buttonOneTitle,
    buttonOneTapped,
    buttonTwoTitle,
    buttonTwoTapped
  }) {
    $.showView({
      props: {
        title
      },
      views: [
        {
          type: "image",
          props: {
            src: imageUrl,
            image: imageData,
            contentMode: $contentMode.scaleAspectFit
          },
          layout: (make, view) => {
            make.top.left.right.equalTo(view.super);
            make.height.equalTo(view.width);
          }
        },
        {
          type: "button",
          props: {
            title: buttonOneTitle,
            bgcolor: $color("#007AFF"),
            titleColor: $color("white")
          },
          layout: (make, view) => {
            make.centerX.equalTo(view.super);
            make.top.equalTo(view.prev.bottom).offset(20);
            make.size.equalTo($size(100, 40));
          },
          events: {
            tapped: sender => {
              buttonOneTapped(sender);
            }
          }
        },
        {
          type: "button",
          props: {
            title: buttonTwoTitle,
            bgcolor: $color("#007AFF"),
            titleColor: $color("white")
          },
          layout: (make, view) => {
            make.centerX.equalTo(view.super);
            make.top.equalTo(view.prev.bottom).offset(20);
            make.size.equalTo($size(100, 40));
          },
          events: {
            tapped: sender => {
              buttonTwoTapped(sender);
            }
          }
        }
      ]
    });
  }
}
class QrcodeLogin {
  constructor(mod) {
    this.Auth = mod.ModuleLoader.getModule("bilibili.auth");
  }
  isLogin() {
    return false;
  }
  getWebKey() {
    return new Promise((resolve, reject) => {
      const url =
        "https://passport.bilibili.com/x/passport-login/web/qrcode/generate";
      $console.info("getWebKey");
      try {
        new HttpLib(url).get().then(resp => {
          if (resp.isError != false) {
            reject(resp.errorMessage || "未知错误");
          } else {
            const result = resp.data;
            if (result.code === 0 && $.hasString(result.data.qrcode_key)) {
              resolve(result.data.qrcode_key);
            } else {
              reject(result.message || "未知错误");
            }
          }
        });
      } catch (error) {
        $console.error(error);
        reject(error.message);
      } finally {
      }
    });
  }
  loginWeb(qrcode_key) {
    return new Promise((resolve, reject) => {
      const url = `https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${qrcode_key}`;
      new HttpLib(url).get().then(resp => {
        $console.info({
          resp
        });
        if (resp.isError != false) {
          reject(resp.errorMessage || "未知错误");
        } else {
          const result = resp.data;
          const { code, url } = result.data;
          $console.info({
            result,
            code,
            url
          });
          try {
            if (result.code == 0 && code == 0) {
              const urlPar = $.getUrlParameters(url),
                Cookies = resp.cookieString;
              $console.info({
                urlPar,
                Cookies,
                resp,
                headers: resp.headers
              });
              if (
                $.hasString(Cookies) &&
                this.Auth.setCookie(Cookies) &&
                this.Auth.setSESSDATA(resp.cookie["SESSDATA"])
              ) {
                resolve();
              } else {
                reject("no cookies");
              }
            } else {
              $console.error(result.message);
              reject(result.message || "未知错误");
            }
          } catch (error) {
            $console.error(error);
            reject(error.message);
          } finally {
          }
        }
      });
    });
  }
}
class BiliModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.login",
      name: "哔哩哔哩登录",
      version: "1"
    });
    this.ModuleLoader = mod.ModuleLoader;
    this.Auth = this.ModuleLoader.getModule("bilibili.auth");
    this.Qrcode = new QrcodeLogin(mod);
    this.ImageView = new ImageView();
  }
  loginByWebQrcode() {
    return new Promise((resolve, reject) => {
      $console.info("loginByWebQrcode");
      this.Qrcode.getWebKey().then(
        qrcode_key => {
          $.stopLoading();
          const loginUrl =
              "https://passport.bilibili.com/h5-app/passport/login/scan?navhide=1\u0026qrcode_key=" +
              qrcode_key,
            qrcodeData = $qrcode.encode(loginUrl);
          const title = "扫码登录",
            buttonOneTitle = "我登录了",
            buttonOneTapped = sender => {
              sender.bgcolor = $color("#007AFF");
              sender.enabled = false;
              sender.title = "Checking...";
              $.startLoading();
              this.Qrcode.loginWeb(qrcode_key)
                .then(result => {
                  $.stopLoading();
                  const {
                    code,
                    message,
                    refresh_token,
                    url,
                    timestamp
                  } = result;
                  $console.info({
                    result
                  });
                  if (code === 0) {
                    sender.title = "登录成功";
                    sender.bgcolor = $color("green");
                    $ui.pop();
                    resolve();
                  } else {
                    sender.enabled = true;
                    sender.title = "还没登录呢";
                    sender.bgcolor = $color("red");
                    $ui.error(message);
                  }
                })
                .catch(fail => {
                  $.stopLoading();
                  sender.enabled = true;
                  sender.title = "我登录了";
                  $ui.error("error");
                  $ui.alert({
                    title: "错误",
                    message: fail.data.message || fail.message,
                    actions: [
                      {
                        title: "OK",
                        disabled: false, // Optional
                        handler: () => {}
                      },
                      {
                        title: "Cancel",
                        handler: () => {
                          $ui.pop();
                        }
                      }
                    ]
                  });
                });
            },
            buttonTwoTitle = "App登录",
            buttonTwoTapped = sender => {
              //这里加个调用哔哩哔哩浏览器
              //BiliService.openWebBrowser(loginUrl);
              this.ModuleLoader.getModule("bilibili.auth").openBrowser();
            };

          this.ImageView.showImageAndTwoButton({
            title,
            imageData: qrcodeData,
            buttonOneTitle,
            buttonOneTapped,
            buttonTwoTitle,
            buttonTwoTapped
          });
        },
        fail => {
          $.stopLoading();
          $ui.error("获取登录二维码失败");
        }
      );
    });
  }
  login() {
    return new Promise((resolve, reject) => {
      $ui.menu({
        items: ["二维码登录(cookie)", "手动输入cookie"],
        handler: (title, idx) => {
          switch (idx) {
            case 0:
              $.startLoading();
              try {
                this.loginByWebQrcode().then(resolve, reject);
              } catch (error) {
                $console.error(error);
                $.stopLoading();
              } finally {
              }
              break;
            case 1:
              $.inputText("", "cookie").then(cookie => {
                if ($.hasString(cookie)) {
                  const su = this.Auth.setCookie(cookie);
                  $console.info({
                    cookie,
                    su
                  });
                  if (su == true) {
                    resolve();
                  } else {
                    reject("保存cookie失败");
                  }
                }
              });
              break;
            default:
          }
        }
      });
    });
  }
  checkLogin() {
    return new Promise((resolve, reject) => {
      if (this.Auth.isLogin()) {
        resolve();
      } else {
        $ui.alert({
          title: "错误",
          message: "还没登录",
          actions: [
            {
              title: "去登录",
              disabled: false, // Optional
              handler: () => {
                this.login().then(resolve, reject);
              }
            },
            {
              title: "假装我登录了",
              disabled: false, // Optional
              handler: () => {
                resolve();
              }
            },
            {
              title: "退出",
              handler: () => {
                reject();
              }
            }
          ]
        });
      }
    });
  }
}
module.exports = BiliModule;
