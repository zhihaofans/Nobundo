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
    "daoshuri.js",
    "free-api.js",
    "example.js",
    "mefang.js",
    "punches.js"
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

    switch ($app.env) {
      case $env.widget:
        this.coreLoader.setWidgetCore("example");
        this.coreLoader.runWidgetCore();
        break;
      default:
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
            this.coreLoader.runCore(this.coreLoader.modList.id[row]);
          }
        );
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
      message: error.message,
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
