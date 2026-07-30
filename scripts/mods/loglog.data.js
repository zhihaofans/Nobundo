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
    this.DATA_DIR = mod.App.DATA_DIR.ICLOUD + "/loglog/";
    this.DATA_FILE_PATH = {
      CONFIG: this.DATA_DIR + "config.json",
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
    wirteIfNoExist(this.DATA_FILE_PATH.CONFIG, "{}");
    wirteIfNoExist(
      this.DATA_FILE_PATH.LOGS_DATA,
      JSON.stringify(defaultLogItemList)
    );
  }
  loadData() {
    return new Promise((resolve, reject) => {
      try {
        const file = $file.read(this.DATA_FILE_PATH.LOGS_DATA),
          text = file.toString(4),
          logs = JSON.parse(text);
        if ($.hasArray(logs)) {
          resolve(logs.map(log => new LogItem(log)));
        } else {
          reject("不是有效记一下数据格式");
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
    this.Core = new DataCore(mod);
  }
  init() {
    //$ui.success("run");
    this.Core.init();
  }
  getNewItem(data) {
    return new LogItem(data);
  }

  getItemType() {
    return LogItemType;
  }
}
module.exports = ExampleModule;
