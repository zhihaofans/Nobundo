const { ModCore } = require("CoreJS"),
  uiKit = require("../../Core.js/ui"),
  next = require("Next"),
  listKit = new uiKit.ListKit();
class AnimalKit {
  constructor(mod) {
    this.Mod = mod;
    this.$ = mod.$;
    this.ANIMAL_LIST = [
      "鼠",
      "牛",
      "虎",
      "兔",
      "龙",
      "蛇",
      "马",
      "羊",
      "猴",
      "鸡",
      "狗",
      "猪"
    ];
    this.MIN_AGE = 1;
    this.MAX_AGE = 100;
  }
  async getChineseCalendar(date) {
    const apiResult = await this.Mod.App.modLoader.runModApi({
      modId: "network_api",
      apiId: "mxnzp.get_chinese_calendar",
      data: date
    });
    return apiResult;
  }
  async getNowAnimal() {
    $ui.loading(true);
    try {
      const dateKit = new next.DateTime(1),
        nowDate = dateKit.getFullDateNumber(),
        chineseCalendarData = await this.getChineseCalendar(nowDate);
    } catch (error) {
      $console.error(error);
    }
    $ui.loading(false);
  }
  getWhatAnimalAge(nowAnimalIndex, whatAnimalIndex) {
    if (!this.$.isNumber(whatAnimalIndex) || !this.$.isNumber(nowAnimalIndex)) {
      return undefined;
    }
    const animalAgeList = [],
      diffAge = nowAnimalIndex - whatAnimalIndex;
    for (let baseAge = this.MIN_AGE; baseAge <= this.MAX_AGE; baseAge += 12) {
      const thisAge = diffAge + baseAge;
      if (thisAge > 0) {
        animalAgeList.push(thisAge);
      }
    }
    const lastAge = animalAgeList[animalAgeList.length - 1];
    if (lastAge + 12 <= this.MAX_AGE) {
      animalAgeList.push(lastAge + 12);
    }
    return animalAgeList;
  }
}

class DaoshuriKit {
  constructor(mod) {
    this.animalKit = new AnimalKit(mod);
  }
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
  constructor(mod) {
    this.Mod = mod;
    this.$ = mod.$;
    this.DSR = new DaoshuriKit(mod);
  }
  init() {
    //TODO: 加个新增倒数事项的功能
    const mainViewList = ["选择日期", "十二生肖"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.getPastDate();
            break;
          case 1:
            this.DSR.animalKit.getNowAnimal();
            break;
        }
      };
    listKit.pushString(this.Mod.MOD_NAME, mainViewList, didSelect);
  }
  async getPastDate() {
    const dateResult = await this.$.dateTime.pickDate(),
      dateTime = new next.DateTime(1);
    dateTime.setDateTime(dateResult);
    if (dateResult) {
      $ui.loading(true);
      const result = this.DSR.getIntervalDate(
          new Date().getTime(),
          dateResult.getTime()
        ),
        chineseCalendarData = await this.DSR.animalKit.getChineseCalendar(
          dateTime.getFullDateNumber()
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
      $ui.loading(false);
      $ui.alert({
        title: text,
        message: JSON.stringify(chineseCalendarData),
        actions: [
          {
            title: "OK"
          }
        ]
      });
    } else {
      $ui.error("取消");
    }
  }
}

class Daoshuri extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "day_master",
      modName: "倒数日",
      version: "2",
      author: "zhihaofans",
      coreVersion: 8
    });
    this.$ = app.$;
  }
  run() {
    try {
      const main = new Main(this);
      main.init();
    } catch (error) {
      $console.error(error);
    }
  }
}
module.exports = Daoshuri;
