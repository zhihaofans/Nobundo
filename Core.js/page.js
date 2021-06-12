const storage = require("./storage");
class SettingPage {
  constructor(mode, setting_id) {
    this.MODE_LIST = {
      PREFS: 0,
      CACHE: 1,
      SQLITE: 2
    };
    this.MODE = mode;
  }
  getData(key) {
    let result = undefined;
    switch (this.MODE_LIST[this.MODE]) {
      case this.MODE_LIST.PREFS:
        result = $prefs.get(key);
        break;
    }
    return result;
  }
}
