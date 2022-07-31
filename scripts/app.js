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
    "content_box.js",
    "keyboard.js"
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
    this.modLoader.addCoreByList(coreModList);
    switch (true) {
      case this.isKeyboardEnv():
        $ui.render({
          props: {
            title: ""
          },
          views: [
            {
              type: "list",
              props: {
                data: [
                  {
                    title: "键盘模式待完善",
                    rows: ["test"]
                  }
                ]
              },
              layout: $layout.fill,
              events: {
                didSelect: (_sender, indexPath, _data) => {
                  const row = indexPath.row;
                }
              }
            }
          ]
        });
        break;
      default:
        this.modLoader.setWidgetMod("example");
        this.modLoader.setContextMod("action_extension");
        this.modLoader.autoRunMod();
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
