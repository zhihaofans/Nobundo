const { ModCore } = require("CoreJS"),
  Next = require("Next"),
  $ = require("$"),
  ListView = new Next.ListView();
class ReminderLib {
  constructor() {}
  editEvent(event, handler) {
    $ui.alert({
      title: event.title,
      message: `提醒时间:${event.alarmDate}\n描述:${event.description}\nUrl:${event.url}`,
      actions: [
        {
          title: "删除",
          handler: () => {
            $reminder.delete({
              event,
              handler
            });
          }
        },
        {
          title: "取消"
        }
      ]
    });
  }
  deleteEvent(event, handler) {
    $ui.alert({
      title: event.title,
      message: `提醒时间:${event.alarmDate}\n描述:${event.description}\nUrl:${event.url}`,
      actions: [
        {
          title: "删除",
          handler: () => {
            $reminder.delete({
              event,
              handler
            });
          }
        },
        {
          title: "取消"
        }
      ]
    });
  }
  showEvents({ hours }) {
    $reminder.fetch({
      startDate: new Date(),
      hours,
      handler: resp => {
        $console.warn(resp);
        if (resp.status == true) {
          const events = resp.events,
            handler = index => {
              const thisEvents = events[index];
              $console.info(thisEvents);
              $ui.menu({
                items: ["编辑", "删除"],
                handler: (title, idx) => {
                  switch (idx) {
                    case 1:
                      this.deleteEvent(thisEvents, resp => {
                        $console.info(resp.status == 1 ? resp : resp.error);
                        if (resp.status == 1) {
                          $ui.alert({
                            title: "成功",
                            message: "请手动退出页面刷新",
                            actions: [
                              {
                                title: "",
                                disabled: false,
                                handler: () => {}
                              }
                            ]
                          });
                        } else {
                          const error = resp.error;
                          $ui.alert({
                            title: `错误代码${error.code}`,
                            message: error.localizedDescription,
                            actions: [
                              {
                                title: "好的",
                                disabled: false,
                                handler: () => {}
                              }
                            ]
                          });
                        }
                      });
                      break;
                  }
                }
              });
            };
          ListView.pushSimpleText(
            `提醒事项(共${events.length}个)`,
            events.map(event => event.title),
            handler
          );
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
  constructor(mod) {
    this.Mod = mod;
    this.$ = mod.$;
    this.ReminderLib = new ReminderLib();
  }
  init() {
    const mainViewList = ["查看所有", "快速添加"],
      didSelect = index => {
        switch (index) {
          case 0:
            this.showEvents();
            break;
          case 1:
            this.quickCreate();
            break;
          default:
            $ui.alert({
              title: index,
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
    ListView.pushSimpleText(this.Mod.MOD_NAME, mainViewList, didSelect);
  }
  async quickCreate() {
    const nowDate = new Date(),
      year = nowDate.getFullYear(),
      month = nowDate.getMonth() + 1,
      date = nowDate.getDate();
    $console.info(`${year}-${month}-${date}`);
    $input.text({
      type: $kbType.text,
      placeholder: "",
      text: "",
      handler: text => {
        if (text.length > 0) {
          $ui.menu({
            items: [
              "今晚8点",
              "今晚9点",
              "今晚10点",
              "今晚11点",
              "明早8点",
              "半小时后"
            ],
            handler: (title, idx) => {
              $ui.loading(true);
              switch (idx) {
                case 0:
                  this.ReminderLib.create({
                    title: text,
                    alarmDate: this.$.dateTime.getTodayWhatTimeDate({
                      hours: 20
                    }),
                    handler: resp => {
                      $console.info(resp);
                      if (resp.status == 1 && resp.error == null) {
                        $ui.success("添加成功");
                      } else {
                        $ui.error("添加失败");
                      }
                      $ui.loading(false);
                    }
                  });
                  break;
                case 1:
                  this.ReminderLib.create({
                    title: text,
                    alarmDate: this.$.dateTime.getTodayWhatTimeDate({
                      hours: 21
                    }),
                    handler: resp => {
                      $console.info(resp);
                      if (resp.status == 1 && resp.error == null) {
                        $ui.success("添加成功");
                      } else {
                        $ui.error("添加失败");
                      }
                      $ui.loading(false);
                    }
                  });
                  break;
                case 2:
                  this.ReminderLib.create({
                    title: text,
                    alarmDate: this.$.dateTime.getTodayWhatTimeDate({
                      hours: 22
                    }),
                    handler: resp => {
                      $console.info(resp);
                      if (resp.status == 1 && resp.error == null) {
                        $ui.success("添加成功");
                      } else {
                        $ui.error("添加失败");
                      }
                      $ui.loading(false);
                    }
                  });
                  break;
                case 3:
                  this.ReminderLib.create({
                    title: text,
                    alarmDate: this.$.dateTime.getTodayWhatTimeDate({
                      hours: 23
                    }),
                    handler: resp => {
                      $console.info(resp);
                      if (resp.status == 1 && resp.error == null) {
                        $ui.success("添加成功");
                      } else {
                        $ui.error("添加失败");
                      }
                      $ui.loading(false);
                    }
                  });
                  break;
                case 4:
                  this.ReminderLib.create({
                    title: text,
                    alarmDate: this.$.dateTime.getTomorrowWhatTimeDate({
                      hours: 8
                    }),
                    handler: resp => {
                      $console.info(resp);
                      if (resp.status == 1 && resp.error == null) {
                        $ui.success("添加成功");
                      } else {
                        $ui.error("添加失败");
                      }
                      $ui.loading(false);
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
  showEvents() {
    $ui.menu({
      items: ["查看48小时内的提醒"],
      handler: (title, idx) => {
        switch (idx) {
          case 0:
            this.ReminderLib.showEvents({ hours: 48 });
            break;
        }
      }
    });
  }
}

class Reminder extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "reminder",
      modName: "提醒事项",
      version: "1a",
      author: "zhihaofans",
      coreVersion: 9
    });
    this.$ = $;
  }
  run() {
    $ui.success("run");
    const main = new Main(this);
    main.init();
  }
}
module.exports = Reminder;
