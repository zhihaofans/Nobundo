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
    $console.info(date1);
    $console.info(date2);
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
    this.Kernel = core.kernel;
    this.Http = new core.Http(5);
    this.$ = core.$;
    this.DSR = new DaoshuriKit();
  }
  init() {
    const mainViewList = ["过去日期", "过去日期"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            $ui.alert({
              title: indexPath.row,
              message: data,
              actions: [
                {
                  title: "OK",
                  disabled: false, // Optional
                  handler: () => {
                    $console.info(
                      this.DSR.getIntervalDate(1643430327000, 1643513127000)
                    );
                  }
                }
              ]
            });
            break;
          case 1:
            this.getPastDate();
            break;
        }
      };
    listKit.pushString(this.Core.MOD_NAME, mainViewList, didSelect);
  }
  async getPastDate() {
    const dateResult = await $picker.date({});
    $console.info(dateResult);
  }
  testView() {
    const dataPicker = {
      type: "date-picker",
      layout: make => {
        make.left.top.right.equalTo(0);
      }
    };
  }
}

class Daoshuri extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      modName: "倒数日",
      version: "1",
      author: "zhihaofans",
      needCoreVersion: 3,
      databaseId: "daoshuri",
      keychainId: "daoshuri"
    });
  }
  run() {
    $ui.success("run");
    const main = new Main(this);
    main.init();
  }
}
module.exports = Daoshuri;
