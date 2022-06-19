const { AppKernel } = require("../Core.js/app"),
  { CoreLoader } = require("../Core.js/core"),
  ui = require("../Core.js/ui"),
  listKit = new ui.ListKit(),
  coreModList = [
    "bilibili.js",
    "jsbox-version.js",
    "wallhaven.js",
    "downloader.js",
    "reminder.js",
    "daymaster.js",
    "free-api.js",
    "example.js",
    "mefang.js",
    "action-extension.js",
    "datacenter.js"
  ];

class App extends AppKernel {
  constructor({ appId, modDir, l10nPath }) {
    super({ appId, modDir, l10nPath });
    this.coreLoader = new CoreLoader({ modDir, app: this });
  }
  init() {
    this.initModList();
    this.info(`启动耗时${new Date().getTime() - this.START_TIME}ms`);
  }
  initModList() {
    this.coreLoader.addCoreByList(coreModList);

    switch (true) {
      case this.isWidgetEnv():
        this.coreLoader.setWidgetCore("example");
        this.coreLoader.runWidgetCore();
        break;
      case this.isAppEnv():
        listKit.renderIdx(
          this.AppInfo.name,
          this.coreLoader.modList.id.map(modId => {
            const thisCore = this.coreLoader.modList.mods[modId];
            if (thisCore.checkCoreVersion() == 0) {
              return thisCore.CORE_INFO.NAME;
            } else {
              return thisCore.CORE_INFO.NAME + "(待更新)";
            }
          }),
          (section, row) => {
            this.coreLoader.runMod(this.coreLoader.modList.id[row]);
          }
        );
        break;
      case this.isActionEnv() || this.isSafariEnv():
        this.coreLoader.setActionCore("action_extension");
        this.coreLoader.runActionCore();
        break;
      default:
        $ui.alert({
          title: "启动失败",
          message: "不支持该启动方式",
          actions: [
            {
              title: "OK",
              disabled: false, // Optional
              handler: () => {
                $app.close();
              }
            }
          ]
        });
    }
  }
}
function run() {
  try {
    const app = new App({
      appId: "zhihaofans.nobundo",
      modDir: "/scripts/mods/",
      l10nPath: "/strings/l10n.js"
    });
    app.init();
  } catch (error) {
    $console.error(error);
    $ui.alert({
      title: "app.js throw",
      message: error.name + "\n" + error.message,
      actions: [
        {
          title: "OK",
          disabled: false, // Optional
          handler: () => {}
        }
      ]
    });
  }
}
module.exports = { run };
