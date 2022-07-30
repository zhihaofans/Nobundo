const { ModCore } = require("../../Core.js/core"),
  NextJs = require("../../Core.js/next"),
  ListView = new NextJs.ListView();
class CourseData {
  // 课程
  constructor({
    id,
    coach_name,
    coach_id,
    coach_avatar,
    book_id,
    course_id,
    course_name,
    course_img,
    course_content,
    memo,
    start_timestamp,
    end_timestamp,
    date,
    time_start,
    time_end,
    user_id,
    loc_name
  }) {
    this.coach_info = {
      id: coach_id,
      name: coach_name,
      avatar: coach_avatar
    };
    this.course_info = {
      class_id: id,
      book_id,
      memo,
      timestamp: {
        start: start_timestamp,
        end: end_timestamp
      },
      datetime: {
        date,
        start_time: time_start,
        end_time: time_end
      },
      location: loc_name,
      course_id,
      name: course_name,
      img: course_img,
      content: course_content
    };
    this.user_info = {
      id: user_id
    };
  }
}
class UserData {
  constructor(core) {
    this.Core = core;
    this.Keychain = core.Keychain;
  }
  getHeader() {
    return {
      "Referer":
        "https://servicewechat.com/wxeee6ace100d9a29a/99/page-frame.html",
      "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.22(0x18001626) NetType/4G Language/zh_CN`,
      "token": this.getToken(),
      "tkid": this.getTkid()
    };
  }
  getTkid() {
    return this.Keychain.get("tkid");
  }
  getToken() {
    return this.Keychain.get("token");
  }
  inputToken() {
    $input.text({
      type: $kbType.text,
      placeholder: "token",
      text: this.getToken(),
      handler: token => {
        if (token.length > 0) {
          $console.info(this.setToken(token));
        } else if (this.getToken() > 0) {
          $ui.alert({
            title: "",
            message: "",
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
  inputTkid() {
    $input.text({
      type: $kbType.text,
      placeholder: "tikd",
      text: this.getTkid(),
      handler: tkid => {
        if (tkid.length > 0) {
          $console.info(this.setTkid(tkid));
        }
      }
    });
  }
  setTkid(tkid) {
    return this.Keychain.set("tkid", tkid);
  }
  setToken(token) {
    return this.Keychain.set("token", token);
  }
}

class MefangApi {
  constructor(core) {
    this.Http = core.$.http;
    this.UserData = new UserData(core);
  }
  addToSystemCalendar(courseData) {
    const coachName = courseData.coach_info.name,
      timestamp = courseData.course_info;
    $calendar.create({
      title: "健身💪",
      startDate: new Date(timestamp.start),
      endDate: new Date(timestamp.end),
      hours: 1,
      notes: `教练：${coachName}\n${coachName}`,
      handler: resp => {
        $console.info();
      }
    });
  }
  checkLoginStatus() {
    const tkid = this.UserData.getTkid(),
      token = this.UserData.getToken();
    if (tkid == undefined || token == undefined) {
      return false;
    }
  }
  async getAllTimesheet({ dateStart, dateEnd, coachId }) {
    const result = await this.getFightBox({
      a: "batch/timesheet",
      d: {
        date_start: "2022-05-28",
        date_end: "2022-05-28",
        coach_id: "251"
      }
    });
    $console.info(result);
  }
  async getCheckinQrcode(scene, width = 600) {
    const result = await this.getCommon({
      a: "wxapp/qrcode",
      d: {
        scene,
        page: "pages/checkin/checkin",
        width
      }
    });
    if (result.errcode != 0) {
      return undefined;
    }
    $console.info(result.result);
    return result.result;
  }
  async getCommon({ a, d }) {
    const url = "https://aifendou.net/common",
      header = this.UserData.getHeader(),
      body = { a, d },
      resp = await this.Http.post({ url, body, header }),
      //response = resp.response,
      data = resp.data;
    $ui.loading(false);
    if (resp.error) {
      $console.error(resp.error);
      return undefined;
    } else {
      $console.error({
        message: data.meno,
        url: "mefang.getCommon." + a,
        data: {
          d
        }
      });
      return data;
    }
  }
  async getFightBox({ a, d }) {
    const url = "https://aifendou.net/fightbox",
      header = this.UserData.getHeader(),
      body = { a, d },
      resp = await this.Http.post({ url, body, header, timeout: 5 }),
      //response = resp.response,
      data = resp.data;
    if (resp.error) {
      $console.error(resp.error);
      return undefined;
    } else {
      if (data.errcode != 0) {
        $console.error({
          message: data.meno,
          url: "mefang.getFightBox." + a,
          data: {
            d
          }
        });
      }
      return data;
    }
  }
  async getMyCoashes() {
    const result = await this.getFightBox({
      a: "book/list",
      d: {
        more: {
          start_pos: 0,
          pagesize: 20
        }
      }
    });
    $console.info(result);
    return result;
  }
  async getReservedTimesheet(coachId, dateStart, dateEnd) {
    const result = await this.getFightBox({
      a: "timesheet",
      d: {
        date_start: dateStart || "2022-05-28",
        date_end: dateEnd || "2022-05-28",
        coach_id: coachId || "251"
      }
    });
    $console.info(result);
    return result;
  }
  async getUserData() {
    const result = await this.getCommon({
      a: "user/get",
      d: {
        who: ""
      }
    });
    if (result.errcode != 0) {
      $console.error(result.meno);
      return undefined;
    }
    $console.info(result.result);
    return result.result;
  }
}

class MefangUi {
  constructor(core) {
    this.Core = core;
    this.$ = core.$;
    this.Api = new MefangApi(core);
  }
  init() {
    const menuList = [
      "输入token",
      "输入tkid",
      "获取课程",
      "课程二维码",
      "获取用户信息",
      "查看教练排班"
    ];
    $ui.menu({
      items: menuList,
      handler: (title, idx) => {
        try {
          switch (idx) {
            case 0:
              this.Api.UserData.inputToken();
              break;
            case 1:
              this.Api.UserData.inputTkid();
              break;
            case 3:
              this.showMyCoashes();
              break;
            case 4:
              this.showUserData();
              break;
            case 5:
              $input.text({
                type: $kbType.text,
                placeholder: "教练id",
                text: this.Core.Keychain.get("coash_timesheet_last_id"),
                handler: coashId => {
                  if (coashId.length > 0) {
                    this.Core.Keychain.set("coash_timesheet_last_id", coashId);
                  }
                  this.showCoachTimesheet(coashId);
                }
              });
              break;
          }
        } catch (error) {
          $console.error(error);
        }
      }
    });
  }
  async showCheckinQrcode(id, book_id) {
    $ui.loading(true);
    const scene = `${id}_${book_id}`,
      resultData = await this.Api.getCheckinQrcode(scene);

    $console.info({
      book_id,
      id,
      resultData
    });
    $ui.loading(false);
    if (resultData.success == true) {
      $ui.preview({
        title: "URL",
        url: resultData.file
      });
    } else {
      $ui.error("获取失败");
    }
  }
  async showCoachTimesheet(coashId) {
    const pickedDate = await this.$.dateTime.pickDate(),
      date = `${pickedDate.getFullYear()}-${
        pickedDate.getMonth() + 1
      }-${pickedDate.getDate()}`;

    $ui.loading(true);
    const resultData = await this.Api.getReservedTimesheet(
      coashId || "251",
      date,
      date
    );
    $console.info({
      date,
      resultData
    });
    $ui.loading(false);
    if (resultData.errcode == 0 && resultData.result.success == true) {
      const timesheetList = resultData.result.list;
      $console.warn({
        timesheetList
      });
      if (timesheetList.length > 0) {
        const timesheetData = resultData.result.list[0],
          coashesList = timesheetData.coaches,
          periods = coashesList[0].periods,
          result = periods.map(item => {
            const customerData = item.customer[0];
            $console.warn(item);
            return {
              date: `${item.time_start}-${item.time_end}`,
              list: [
                {
                  title: item.memo
                },
                {
                  title: `${customerData.name}(${customerData.user_nickname})`,
                  func: undefined
                },
                {
                  title: customerData.user_avatar,
                  func: () => {
                    $ui.preview({
                      title: "头像",
                      url: customerData.user_avatar
                    });
                  }
                },
                {
                  title: item.loc_name
                }
              ]
            };
          });
        $console.info({
          coashesList: coashesList.length,
          periods: periods.length
        });
        if (coashesList.length > 0 && periods.length > 0) {
          $ui.push({
            props: {
              title: timesheetData.date
            },
            views: [
              {
                type: "list",
                props: {
                  data: result.map(item => {
                    return {
                      title: item.date,
                      rows: item.list.map(row => row.title)
                    };
                  })
                },
                layout: $layout.fill,
                events: {
                  didSelect: (_sender, indexPath, _data) => {
                    const section = indexPath.section,
                      row = indexPath.row,
                      thisCoashes = result[section],
                      thisTitle = thisCoashes.list[row];
                    if (this.$.isFunction(thisTitle.func)) {
                      try {
                        thisTitle.func();
                      } catch (error) {
                        $console.error(error);
                      }
                    } else {
                      $share.sheet([thisTitle.title]);
                    }
                  }
                }
              }
            ]
          });
        } else {
          $ui.warn("今天没有排班");
        }
        $console.warn(timesheetData);
      } else {
        $ui.error("0个结果");
      }
    } else {
      $ui.error("(" + resultData.errcode + ")" + resultData.memo);
    }
  }

  async showMyCoashes() {
    $ui.loading(true);
    const myCoashesData = await this.Api.getMyCoashes();
    $ui.loading(false);
    if (myCoashesData.errcode != 0) {
      $ui.error(`[${myCoashesData.errcode}]${myCoashesData.memo}`);
    } else {
      const resultData = myCoashesData.result,
        myCoashesList = resultData.list;
      if (resultData.success == false) {
        $ui.error(`result.success:${resultData.success}`);
      } else if (myCoashesList == undefined || myCoashesList.length == 0) {
        $ui.error("还没约课呢！");
      } else {
        const listData_myCoashes = [];
        myCoashesList.map(coashes => {
          //$console.warn(coashes);
          const {
              id,
              date,
              time_start,
              time_end,
              course_name,
              course_id,
              book_id,
              coach_name,
              coach_id,
              status,
              memo
            } = coashes,
            thisCourseData = {
              id,
              date,
              time: time_start + "-" + time_end,
              dateTime: `${date} ${time_start}-${time_end}`,
              course: {
                id: course_id,
                title: course_name
              },
              coach: {
                id: coach_id,
                name: coach_name
              },
              status,
              title: memo,
              book_id
            };
          if (coashes.status == 1) {
            $console.warn(thisCourseData);
            listData_myCoashes.push(thisCourseData);
          }
        });

        const listData = listData_myCoashes.map(item => {
          return {
            title: item.dateTime,
            rows: [
              {
                title: item.title,
                func: undefined
              },
              {
                title: item.course.title,
                func: undefined
              },
              {
                title: `教练:${item.coach.name}(${item.coach.id})`,
                func: undefined
              },
              {
                title: `查看签到二维码`,
                func: () => {
                  this.showCheckinQrcode(item.id, item.book_id);
                }
              },
              {
                title: `写入日历`,
                func: () => {
                  this.showCheckinQrcode(item.id, item.book_id);
                }
              }
            ]
          };
        });

        ListView.pushSimpleList("我的课程", listData, data => {
          $share.sheet([data]);
        });
        //        $ui.push({
        //          props: {
        //            title: "我的课程"
        //          },
        //          views: [
        //            {
        //              type: "list",
        //              props: {
        //                data: listData.map(item => {
        //                  return {
        //                    title: item.title,
        //                    rows: item.rows.map(data => data.title)
        //                  };
        //                })
        //              },
        //              layout: $layout.fill,
        //              events: {
        //                didSelect: (_sender, indexPath, _data) => {
        //                  const section = indexPath.section,
        //                    row = indexPath.row,
        //                    thisCourse = listViewData[section],
        //                    thisClicked = thisCourse.data[row];
        //                  if (this.$.isFunction(thisClicked.func)) {
        //                    try {
        //                      thisClicked.func();
        //                    } catch (error) {
        //                      $ui.error(error.name);
        //                      $console.error(error);
        //                    }
        //                  } else {
        //                    $share.sheet([thisClicked.title]);
        //                  }
        //                }
        //              }
        //            }
        //          ]
        //        });
      }
    }
  }
  async showUserData() {
    $ui.loading(true);
    const userData = await this.Api.getUserData();
    $ui.loading(false);
    if (userData == undefined) {
      $ui.error("获取失败");
    } else if (userData.success) {
      const userDataList = [
        {
          title: "姓名",
          value: userData.name
        },

        {
          title: "phone",
          value: userData.phone
        },
        {
          title: "avatar",
          value: userData.avatar,
          onClick: value => {
            $ui.preview({
              title: "头像",
              url: value
            });
          }
        },
        {
          title: "session key",
          value: userData.session_key
        },
        {
          title: "unionid",
          value: userData.unionid
        },
        {
          title: "uid",
          value: userData.uid
        },
        {
          title: "mini_openid",
          value: userData.mini_openid
        },
        {
          title: "created_at",
          value: userData.created_at
        },
        {
          title: "updated_at",
          value: userData.updated_at
        }
      ];
      $console.warn(userDataList);
      $ui.push({
        props: {
          title: "用户信息"
        },
        views: [
          {
            type: "list",
            props: {
              data: userDataList.map(item => {
                return {
                  title: item.title,
                  rows: [item.value]
                };
              })
            },
            layout: $layout.fill,
            events: {
              didSelect: (sender, indexPath, data) => {
                const section = indexPath.section,
                  //row = indexPath.row,
                  thisItem = userDataList[section];
                if (this.$.isFunction(thisItem.onClick)) {
                  try {
                    thisItem.onClick(data);
                  } catch (error) {
                    $console.error(error);
                  }
                } else {
                  $share.sheet([thisItem.value]);
                }
              }
            }
          }
        ]
      });
    } else {
      $ui.error("请登录");
    }
  }
}

class Mefang extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "mefang",
      modName: "么方运动",
      version: "1",
      author: "zhihaofans",
      coreVersion: 6
    });
    this.ui = new MefangUi(this);
  }
  run() {
    this.ui.init();
  }
}
module.exports = Mefang;
