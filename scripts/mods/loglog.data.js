const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  $ = require("$"),
  ListViewKit = new Next.ListView();
function wirteIfNoExist(filePath, data) {
  if (!$file.exists(filePath)) {
    // 转为 UTF8 二进制Buffer写入
    const success = $file.write({
      data: $data({
        string: data,
        encoding: 4
      }),
      path: filePath
    });
    $console.info({
      wirteIfNoExist: success,
      filePath
    });
    return success;
  }
}
const LogItemType = {
  TEXT: "text",
  CHECK: "check"
};
class LogItem {
  constructor(item) {
    this.id = item.id || $text.uuid;
    this.title = item.title || "";
    this.desc = item.desc || "";
    this.type = item.type || LogItemType.TEXT; //LogItemType
    this.group_id = item.group_id;
    this.create_time = item.create_time || $.getUnixTime();
    this.update_time = item.update_time || this.create_time;
    this.json_str = item.json_str || "{}";
  }
  getJsonData() {
    try {
      return JSON.parse(this.json_str);
    } catch (error) {
      $console.error(error);
      return {};
    }
  }
  getJsonItem(key, defaultValue) {
    const value = this.getJsonData()[key] || defaultValue;
    this.saveJsonItem(key, value);
    return value;
  }
  saveJsonItem(key, value) {
    let data = this.getJsonData();
    data[key] = value;
    this.json_str = JSON.stringify(data);
  }
}
class DataCore {
  constructor(mod) {
    this.LOGS_DATA_TYPE = mod.Config.getConfigItem("logs_dir");
    $console.error({
      LOGS_DATA_TYPE: this.LOGS_DATA_TYPE
    });
    this.DATA_DIR =
      (this.LOGS_DATA_TYPE == 1
        ? mod.App.DATA_DIR.ICLOUD
        : mod.App.DATA_DIR.SHARED) + "loglog/";
    this.DATA_FILE_PATH = {
      LOGS_DATA: this.DATA_DIR + "logs.json"
    };
  }
  init() {
    $.mkdirs(this.DATA_DIR);
    this.initConfig();
  }
  initConfig() {
    const defaultLogItemList = [
      new LogItem({
        title: "这个是例子",
        desc: "文本例子",
        type: LogItemType.TEXT,
        group_id: "default_group"
      })
    ];
    wirteIfNoExist(
      this.DATA_FILE_PATH.LOGS_DATA,
      JSON.stringify(defaultLogItemList)
    );
  }
  loadData() {
    return new Promise((resolve, reject) => {
      try {
        const file = $file.read(this.DATA_FILE_PATH.LOGS_DATA);

        if (file == undefined) {
          reject("iCloud网络异常或文件格式错误");
        } else {
          const text = file.toString(4),
            logs = JSON.parse(text);
          if ($.hasArray(logs)) {
            resolve(logs.map(log => new LogItem(log)));
          } else {
            reject("不是有效记一下数据格式");
          }
        }
      } catch (error) {
        $console.error(error);
        reject("catch:" + error.message);
      } finally {
        $console.info("loadData.finally");
      }
    });
  }
  saveLogData(data) {
    const success = $file.write({
      data: $data({
        string: JSON.stringify(data),
        encoding: 4
      }),
      path: this.DATA_FILE_PATH.LOGS_DATA
    });
    return success;
  }
  removeLogItem(id) {
    return new Promise((resolve, reject) => {
      this.loadData()
        .then(oldLogs => {
          const newLogs = oldLogs.filter(log => log.id != id);
          const result = this.saveLogData(newLogs);
          if (result == true) {
            resolve(result);
          } else {
            $console.error({
              saveLogData: result,
              newLogs
            });
            reject("saveLogData false");
          }
        })
        .catch(reject);
    });
  }
}

class ExampleModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "loglog.data",
      name: "记一下数据核心",
      version: "1"
    });
  }
  init() {
    //$ui.success("run");
    this.Core = new DataCore(this.Mod);
    this.Core.init();
  }
  getNewItem(item) {
    return new LogItem({
      title: item.title,
      desc: item.desc,
      type: item.type,
      group_id: item.group_id,
      create_time: $.getUnixTime(),
      update_time: $.getUnixTime(),
      json_str: item.json_str
    });
  }

  getItemType() {
    return LogItemType;
  }
  removeItem(id) {
    return this.Core.removeLogItem(id)
  }
}
module.exports = ExampleModule;
