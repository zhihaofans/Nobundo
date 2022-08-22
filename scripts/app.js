const AppKernel = require("../Core.js/app"),
  { ModLoader } = require("../Core.js/core"),
  coreModList = [
    "bilibili.js",
    "jsbox_version.js",
    "wallhaven.js",
    "downloader.js",
    "reminder.js",
    "daymaster.js",
    "example.js",
    "mefang.js",
    "action_extension.js",
    "datacenter.js",
    "content_box.js",
    "keyboard.js",
    "photo_manager.js",
    "search.js",
    "network_api.js"
  ];

class App extends AppKernel {
  constructor({ appId, modDir, l10nPath }) {
    super({ appId, modDir, l10nPath });
    this.modLoader = new ModLoader({ modDir, app: this });
  }
  init() {
    try {
      this.initModList();
    } catch (error) {
      $console.error(error);
    } finally {
      this.$.info(`启动耗时${new Date().getTime() - this.START_TIME}ms`);
    }
  }
  initModList() {
    this.modLoader.addModsByList(coreModList);
    this.modLoader.setKeyboardMod("keyboard");
    this.modLoader.setWidgetMod("example");
    this.modLoader.setContextMod("action_extension");
    this.modLoader.autoRunMod();
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
