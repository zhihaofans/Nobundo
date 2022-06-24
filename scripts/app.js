const AppKernel = require("../Core.js/app"),
  { ModLoader } = require("../Core.js/core"),
  ui = require("../Core.js/ui"),
  listKit = new ui.ListKit(),
  coreModList = [
    "bilibili.js",
    "jsbox_version.js",
    "wallhaven.js",
    "downloader.js",
    "reminder.js",
    "daymaster.js",
    "free_api.js",
    "example.js",
    "mefang.js",
    "action_extension.js",
    "datacenter.js",
    "content_box.js"
  ];

class App extends AppKernel {
  constructor({ appId, modDir, l10nPath }) {
    super({ appId, modDir, l10nPath });
    this.modLoader = new ModLoader({ modDir, app: this });
  }
  init() {
    this.initModList();
    this.$.info(`启动耗时${new Date().getTime() - this.START_TIME}ms`);
  }
  initModList() {
    this.modLoader.addCoreByList(coreModList);

    switch (true) {
      case this.isWidgetEnv():
        this.modLoader.setWidgetMod("example");
        this.modLoader.runWidgetMod();
        break;
      case this.isAppEnv():
        listKit.renderIdx(
          this.AppInfo.name,
          this.modLoader.getModList().id.map(modId => {
            const thisMod = this.modLoader.getModList().mods[modId];
            if (thisMod.checkCoreVersion() == 0) {
              return thisMod.MOD_INFO.NAME;
            } else {
              return thisMod.MOD_INFO.NAME + "(待更新)";
            }
          }),
          (section, row) => {
            this.modLoader.runMod(this.modLoader.getModList().id[row]);
          }
        );
        break;
      case this.isActionEnv() || this.isSafariEnv():
        this.modLoader.setContextMod("action_extension");
        this.modLoader.runContextMod();
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
