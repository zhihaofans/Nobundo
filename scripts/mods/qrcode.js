const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$"),
  //HttpLib = require("HttpLib"),
  { NavView } = require("ViewKit");
class ParseView {
  constructor(mod) {
    this.Rule = mod.ModuleLoader.getModule("qrcode.rule");
  }
  initView(text, ruleItemList) {
    if ($.hasString(text) && $.hasArray(ruleItemList)) {
      $ui.push({
        props: {
          title: "解析结果"
        },
        views: [
          {
            type: "list",
            props: {
              data: ruleItemList.map(item => item.title)
            },
            layout: $layout.fill,
            events: {
              didSelect: (sender, indexPath, data) => {
                const { row } = indexPath;
                const rule = ruleItemList[row];
                rule.func(text);
              }
            }
          }
        ]
      });
    } else {
      $ui.error("空白结果");
    }
  }
  init(text, scanMode = false) {
    $console.info(text);
    this.Rule.parse(text, scanMode)
      .then(result => {
        $ui.success("解析成功");
        $console.info({
          result
        });
        this.initView(text, result);
      })
      .catch(result => {
        $console.error(result);
        $ui.error("解析失败");
      });
  }
}
class MainView {
  constructor(mod) {
    this.Mod = mod;
    this.Rules = mod.ModuleLoader.getModule("qrcode.rule");
    this.ParseView = new ParseView(mod);
    this.QRCODE_TEXT =
      this.Mod.Config.getConfigItem("history.qrcodetext") ||
      "https://images.apple.com/v/ios/what-is/b/images/performance_large.jpg";
  }
  scanQrcode() {
    const autoParse = this.Mod.Config.getConfigItem("qrcode.scan.auto_parse");
    $console.info({
      autoParse
    });
    $qrcode.scan(text => {
      $console.info(text);
      if ($.hasString(text)) {
        this.setQrcode(text);
        if (autoParse == true) {
          $ui.success("扫描成功");
          this.ParseView.init(text, true);
        } else {
          $input.text({
            type: $kbType.text,
            placeholder: "",
            text: text,
            handler: newText => {}
          });
        }
      } else {
        $ui.error("空白二维码");
      }
    });
  }
  setQrcode(text) {
    if ($.hasString(text)) {
      this.Mod.Config.setConfigItem("history.qrcodetext", text);
      this.QRCODE_TEXT = text;
      $ui.get("image_qrcode").data = $qrcode.encode(this.QRCODE_TEXT).png;
    }
  }
  init() {
    $console.info("qrcode.init");
    const autoScan =
      this.Mod.Config.getConfigItem("qrcode.scan.auto_scan") === true;
    const navList = [
      {
        title: "扫一扫",
        icon: "qrcode.viewfinder",
        selected: true,
        func: () => {
          this.scanQrcode();
        }
      },
      {
        title: "规则",
        icon: "list.dash",
        func: () => {
          try {
            this.Rules.showRuleView();
          } catch (error) {
            $console.error(error);
          }
        }
      },
      {
        title: "设置",
        icon: "gear",
        func: () => {
          this.Mod.Config.showConfig().catch(err => {
            $console.error(err);
          });
        }
      }
    ];
    new NavView()
      .showNavView({
        title: "二维码",
        navList,
        mainViewData: this.getEditTextView()
      })
      .then(sender => {
        $console.info("qr ode.then");
        if (autoScan) {
          this.scanQrcode();
        }
      });
  }
  getEditTextView() {
    return {
      type: "view",
      props: {},
      layout: $layout.fill,
      events: {},
      views: [
        {
          type: "image",
          props: {
            id: "image_qrcode",
            data: $qrcode.encode(this.QRCODE_TEXT).png,
            menu: {
              title: "二维码",
              items: [
                {
                  title: "保存到相册",
                  handler: sender => {
                    $photo.save({
                      data: $ui.get("image_qrcode").data,
                      handler: success => {
                        if (success) {
                          $ui.success("保存成功");
                        } else {
                          $ui.error("保存失败");
                        }
                      }
                    });
                  }
                },
                {
                  title: "分享",
                  handler: sender => {
                    $share.sheet([
                      {
                        "name": "qrcode.png",
                        "data": $ui.get("image_qrcode").data
                      }
                    ]);
                  }
                }
              ]
            }
          },
          layout: (make, view) => {
            make.top.equalTo(50);
            make.centerX.equalTo(view.super);

            make.size.equalTo($size(200, 200));
          },
          events: {
            tapped: sender => {
              $input.text({
                type: $kbType.text,
                placeholder: "",
                text: this.QRCODE_TEXT,
                handler: newText => {
                  if ($.hasString(newText)) {
                    this.setQrcode(newText);
                  }
                }
              });
            }
          }
        },
        {
          type: "button",
          props: {
            title: "解析内容"
          },
          layout: function (make, view) {
            make.centerX.equalTo(view.super);

            make.width.equalTo($ui.get("image_qrcode").width);
            make.top.equalTo($ui.get("image_qrcode").bottom).offset(50);
            make.height.equalTo(40);
          },
          events: {
            tapped: sender => {
              this.ParseView.init(this.QRCODE_TEXT);
            }
          }
        }
      ]
    };
  }
}
class Example extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "qrcode",
      modName: "二维码",
      version: "2",
      author: "zhihaofans",
      iconName: "qrcode",
      coreVersion: 21,
      useSqlite: true,
      allowWidget: true,
      allowApi: true,
      allowConfig: true,
      configData: [
        {
          id: "qrcode.scan.auto_scan",
          title: "启动时自动扫码",
          placeholder: "没有输入时显示的提示",
          type: "boolean",
          default: false
        },
        {
          id: "qrcode.scan.auto_parse",
          title: "扫码后自动解析",
          placeholder: "没有输入时显示的提示",
          
          type: "boolean",
          default: false
        },
        {
          id: "history.qrcodetext",
          title: "最后扫码",
          placeholder: "没有输入时显示的提示",
          insetGrouped:true,
          inline:true,
          type: "text",
          default: false
        }
      ]
    });
    this.ModuleLoader = new ModuleLoader(this);
    this.ModuleLoader.addModule("qrcode.rule.js");
    this.MainView = new MainView(this);
  }
  run() {
    try {
      this.MainView.init();
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
