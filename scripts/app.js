const { AppKernel } = require("CoreJS"),
  $ = require("$"),
  modsConfig = require("./mods.js");
$console.info(modsConfig);
class App extends AppKernel {
  constructor({ appId, modDir, modList, l10nPath }) {
    super({ appId, modDir, l10nPath, modList });
  }
  init() {
    $.startLoading();
    try {
      this.initModList();
    } catch (error) {
      $console.error(error);
    } finally {
      $.info(`启动耗时${new Date().getTime() - this.START_TIME}ms`);
      $.stopLoading();
    }
  }
  initModList() {
    this.ModLoader.setKeyboardMod("keyboard");
    this.ModLoader.setWidgetMod("example");
    this.ModLoader.setContextMod("action_extension");
    this.ModLoader.WidgetLoader.registerWidget({
      id: "example",
      modId: "example",
      title: "例子",
      size: $widgetFamily.small
    });

    if ($.isKeyboardEnv()) {
      this.ModLoader.runKeyboardMod();
    } else if ($.isActionEnv()) {
      this.ModLoader.runContext();
    } else {
      this.ModLoader.showGridModList();
    }
  }
}
function run() {
  try {
    const app = new App({
      appId: "zhihaofans.nobundo",
      modDir: modsConfig.modDir,
      modList: modsConfig.mods,
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
