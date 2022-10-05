const { AppKernel, ModLoader } = require("CoreJS"),
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
    "network_api.js",
    "mod_manager.js",
    "web_browser.js"
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
    this.modLoader.WidgetLoader.registerWidget({
      id: "example",
      modId: "example",
      title: "例子",
      size: $widgetFamily.small
    });
    this.modLoader.WidgetLoader.registerWidget({
      id: "network_api.mxnzp.today.lunarCalendar",
      modId: "network_api",
      title: "今日农历日期",
      size: $widgetFamily.accessoryInline
    });
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
