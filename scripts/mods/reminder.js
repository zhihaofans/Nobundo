const { Core } = require("../../Core.js/core"),
  uiKit = require("../../Core.js/ui"),
  listKit = new uiKit.ListKit();
class ReminderLib {
  constructor() {}
  init() {
    $reminder.fetch({
      startDate: new Date(),
      hours: 2 * 24,
      handler: resp => {
        $console.warn(resp);
        if (resp.status == true) {
          const events = resp.events;
        } else {
          $ui.alert({
            title: "加载提醒事项错误",
            message: `错误信息(${resp.error.description})`,
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
    });
  }
  create({ title, alarmDate, notes, url, handler = resp => {} }) {
    $console.warn(alarmDate);
    $reminder.create({
      title,
      alarmDate,
      notes,
      url,
      handler
    });
  }
}

class Main {
  constructor(core) {
    this.Core = core;
    this.Kernel = core.kernel;
    this.ReminderLib = new ReminderLib();
  }
  init() {
    const mainViewList = ["快速添加"],
      didSelect = (sender, indexPath, data) => {
        switch (indexPath.row) {
          case 0:
            this.quickCreate();
            break;
          default:
            $ui.alert({
              title: indexPath.row,
              message: data,
              actions: [
                {
                  title: "OK",
                  disabled: false, // Optional
                  handler: () => {}
                }
              ]
            });
        }
      };
    listKit.pushString(this.Core.MOD_NAME, mainViewList, didSelect);
  }
  async quickCreate() {
    const nowDate = new Date(),
      year = nowDate.getFullYear(),
      month = nowDate.getMonth() + 1,
      date = nowDate.getDate();
    $console.warn(`${year}-${month}-${date}`);
    $input.text({
      type: $kbType.text,
      placeholder: "",
      text: "",
      handler: text => {
        if (text.length > 0) {
          $ui.menu({
            items: ["今晚8点", "今晚9点"],
            handler: (title, idx) => {
              switch (idx) {
                case 0:
                  this.ReminderLib.create({
                    title: text,
                    alarmDate: new Date(year, month - 1, date, 20),
                    handler: resp => {
                      $console.info(resp);
                      if (resp.status == 1 && resp.error == null) {
                        $ui.success("添加成功");
                      } else {
                        $ui.error("添加失败");
                      }
                    }
                  });
                  break;
                case 1:
                  this.ReminderLib.create({
                    title: text,
                    alarmDate: new Date(year, month - 1, date, 21),
                    handler: resp => {
                      $console.info(resp);
                      if (resp.status == 1 && resp.error == null) {
                        $ui.success("添加成功");
                      } else {
                        $ui.error("添加失败");
                      }
                    }
                  });
                  break;
              }
            },
            finished: cancelled => {
              $console.info(`cancel:${cancelled}`);
            }
          });
        }
      }
    });
  }
}

class Reminder extends Core {
  constructor(kernel) {
    super({
      kernel: kernel,
      modName: "提醒事项",
      version: "1",
      author: "zhihaofans",
      needCoreVersion: 3,
      databaseId: "reminder",
      keychainId: "reminder"
    });
  }
  run() {
    $ui.success("run");
    const main = new Main(this);
    main.init();
  }
}
module.exports = Reminder;
