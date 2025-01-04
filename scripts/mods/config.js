const { ModCore, ModuleLoader } = require("CoreJS"),
  $ = require("$"),
  { Http, Storage } = require("Next");
class ConfigCore {
  constructor() {}
  async showConfig(config) {
    const editedJson = await $prefs.edit(config);
    return editedJson;
  }
  showOneStringConfig(title, id, defaultValue) {
    return new Promise((resolve, reject) => {
      const configData = {
        "title": "设置",
        "items": [
          {
            "title": title,
            "type": "string",
            "key": id,
            "value": defaultValue,
            "inline": false // 文本框是否行内编辑
          }
        ]
      };
      this.showConfig(configData).then(resultJson => {
        resolve(resultJson.items[0].value);
      });
    });
  }
}
class Example extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "config",
      modName: "设置",
      version: "1",
      author: "zhihaofans",
      coreVersion: 14,
      useSqlite: false,
      allowWidget: false,
      allowApi: true,
      iconName: "gear"
    });
    this.Core = new ConfigCore();
  }
  run() {
    try {
      this.Core.showOneStringConfig("测试", "test", "测试一下").then(result => {
        $console.info(result);
      });
    } catch (error) {
      $console.error(error);
    }
    //$ui.success("run");
  }
  showConfig() {
    const configData = {
      "title": "Nobundo设置",
      "items": [
        {
          "title": "title",
          "type": "string",
          "key": "id",
          "value": "defaultValue",
          "inline": false // 文本框是否行内编辑
        }
      ]
    };
  }
  runApi({ apiId, data, callback }) {
    $console.info({
      apiId,
      data,
      callback
    });
    switch (apiId) {
      case "config.show_one_string":
        this.Core.showOneStringConfig(
          data.title,
          data.id,
          data.defaultValue
        ).then(result => {
          $console.info(result);
          callback(result);
        });
        break;
      case "config.show_config":
        this.Core.showConfig(data.config).then(result => {
          $console.info(result);
          callback(result);
        });
        break;
      default:
    }
  }
}
module.exports = Example;
