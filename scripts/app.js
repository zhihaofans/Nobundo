const { AppKernel, ModLoader } = require("CoreJS"),
  $ = require("$"),
  modsConfig = require("./mods.js"),
  coreModList = modsConfig["mods"];
$console.info(modsConfig);
class App extends AppKernel {
  constructor({ appId, modDir, l10nPath }) {
    super({ appId, modDir, l10nPath });
    this.modLoader = new ModLoader({ modDir, app: this });
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

    if ($.isKeyboardEnv()) {
      this.modLoader.runKeyboardMod();
    } else {
      this.modLoader.showGridModList();
    }
  }
}
function run() {
  try {
    const app = new App({
      appId: "zhihaofans.nobundo",
      modDir: modsConfig.modDir,
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
