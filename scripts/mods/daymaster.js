const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class DaoshuriKit {
  constructor() {}
  getIntervalDate(timestamp1, timestamp2) {
    const date1 = new Date(timestamp1),
      date2 = new Date(timestamp2),
      year1 = date1.getFullYear(),
      month1 = date1.getMonth() + 1,
      day1 = date1.getDate(),
      year2 = date2.getFullYear(),
      month2 = date2.getMonth() + 1,
      day2 = date2.getDate();
    if (year1 == year2 && month1 == month2 && day1 == day2) {
      return 0;
    }
    const newDate1 = new Date(year1, month1 - 1, day1 + 1),
      newDate2 = new Date(year2, month2 - 1, day2 + 1),
      intervalTimestamp = newDate2.getTime() - newDate1.getTime(),
      intervalDays = Math.ceil(intervalTimestamp / 1000 / 60 / 60 / 24);
    return intervalDays;
  }
}
class Main {
  constructor(core) {
    this.Core = core;
    this.$ = core.$;
    this.DSR = new DaoshuriKit();
  }
  init() {
    //TODO: 加个新增倒数事项的功能
    const mainViewList = ["选择日期"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.getPastDate();
            break;
        }
      };
    listKit.pushString(this.Core.MOD_NAME, mainViewList, didSelect);
  }
  async getPastDate() {
    const dateResult = await this.$.dateTime.pickDate();
    if (dateResult) {
      const result = this.DSR.getIntervalDate(
        new Date().getTime(),
        dateResult.getTime()
      );
      let text = "";
      if (result == 0) {
        text = "今天";
      } else if (result < 0) {
        text = `${result * -1}天前`;
      } else if (result > 0) {
        text = `${result}天后`;
      } else {
        text = `未知结果：${result}`;
      }
      $ui.alert({
        title: "结果",
        message: text,
        actions: [
          {
            title: "OK"
          }
        ]
      });
    }
  }
}

class Daoshuri extends Core {
  constructor(app) {
    super({
      app,
      modId: "day_master",
      modName: "倒数日",
      version: "1",
      author: "zhihaofans",
      coreVersion: 5
    });
  }
  run() {
    $ui.success("run");
    const main = new Main(this);
    main.init();
  }
}
module.exports = Daoshuri;
