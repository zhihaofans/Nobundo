class DateTime {
  constructor(mode) {
    this.DATE_TIME = new Date(); //pickDateTime后可修改
    this.MODE = mode || 2; //0:时间,1:日期,2:日期时间
  }
  setDateTime(newDateTime) {
    this.DATE_TIME = new Date(newDateTime);
  }
  setMode(newMode) {
    switch (newMode) {
      case 0:
      case 1:
      case 2:
        this.MODE = newMode;
        break;
    }
  }
  async pickDateTime(mode) {
    this.DATE_TIME = await $picker.date({ props: { mode: mode || this.MODE } });
  }
  getFullDateStr() {
    //返回2022-01-01格式的日期
    const dateTime = this.DATE_TIME,
      year = dateTime.getFullYear(),
      month = dateTime.getMonth() + 1,
      date = dateTime.getDate(),
      result = `${year}-${month >= 10 ? month : "0" + month}-${
        date >= 10 ? date : "0" + date
      }`;
    return result;
  }
  getFullDateTimeStr() {
    //返回2022-01-01 00:11:22格式的日期
    const dateTime = this.DATE_TIME,
      year = dateTime.getFullYear(),
      month = dateTime.getMonth() + 1,
      date = dateTime.getDate(),
      hours = dateTime.getHours(),
      minutes = dateTime.getMinutes(),
      seconds = dateTime.getSeconds(),
      result = `${year}-${month >= 10 ? month : "0" + month}-${
        date >= 10 ? date : "0" + date
      } ${hours >= 10 ? hours : "0" + hours}:${
        minutes >= 10 ? minutes : "0" + minutes
      }:${seconds >= 10 ? seconds : "0" + seconds}`;
    return result;
  }
  getShortDateStr() {
    //返回2022-1-1 0:1:22格式的日期
    const dateTime = this.DATE_TIME,
      year = dateTime.getFullYear(),
      month = dateTime.getMonth() + 1,
      date = dateTime.getDate(),
      result = `${year}-${month}-${date}`;
    return result;
  }
  getShortDateTimeStr() {
    //返回2022-1-1 0:1:22格式的日期
    const dateTime = this.DATE_TIME,
      year = dateTime.getFullYear(),
      month = dateTime.getMonth() + 1,
      date = dateTime.getDate(),
      hours = dateTime.getHours(),
      minutes = dateTime.getMinutes(),
      seconds = dateTime.getSeconds(),
      result = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
    return result;
  }
  getUnixTime() {
    return this.DATE_TIME.getTime();
  }
}
class ListView {
  constructor() {
    this.AUTO_ROW_HEIGHT = false;
    this.ESTIMATED_ROW_HEIGHT = undefined;
  }
  pushSimpleList(title, listData, defaultFunc) {
    //    const listData = [
    //      {
    //        title: "标题",
    //        rows: [
    //          {
    //            title: "列表项",
    //            func: data => {
    //              // 会自动带入所选项的文本到data
    //            }
    //          }
    //        ]
    //      }
    //    ];
    $ui.push({
      props: {
        title
      },
      views: [
        {
          type: "list",
          props: {
            autoRowHeight: this.AUTO_ROW_HEIGHT,
            estimatedRowHeight: this.ESTIMATED_ROW_HEIGHT,
            data: listData.map(group => {
              return {
                title: group.title,
                rows: group.rows.map(row => row.title.toString())
              };
            })
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const section = indexPath.section,
                row = indexPath.row,
                clickItem = listData[section].rows[row];
              if (
                clickItem.func != undefined &&
                typeof clickItem.func == "function"
              ) {
                try {
                  clickItem.func(data);
                } catch (error) {
                  $console.error(error);
                }
              } else if (
                defaultFunc != undefined &&
                typeof defaultFunc == "function"
              ) {
                try {
                  defaultFunc(data);
                } catch (error) {
                  $console.error(error);
                }
              }
            }
          }
        }
      ]
    });
  }
  setAutoRowHeight(autoRowHeight) {
    this.AUTO_ROW_HEIGHT = autoRowHeight == true;
  }
  setEstimatedRowHeight(estimatedRowHeight) {
    this.ESTIMATED_ROW_HEIGHT = estimatedRowHeight || 10;
  }
  pushTwoLineList({
    id,
    title,
    navButtons,
    items = [
      {
        title: "title",
        subTitle: "subTitle"
      }
    ],
    handler = (section, row, data) => {
      $console.info({
        section,
        row,
        data
      });
    }
  }) {
    $ui.push({
      props: {
        id,
        title,
        navButtons
      },
      views: [
        {
          type: "list",
          props: {
            autoRowHeight: this.AUTO_ROW_HEIGHT,
            estimatedRowHeight: this.ESTIMATED_ROW_HEIGHT,
            template: {
              props: {
                bgcolor: $color("clear")
              },
              views: [
                {
                  type: "stack",
                  props: {
                    axis: $stackViewAxis.vertical,
                    spacing: 5,
                    distribution: $stackViewDistribution.fillProportionally,
                    stack: {
                      views: [
                        {
                          type: "label",
                          props: {
                            id: "title",

                            align: $align.left,
                            font: $font(24)
                          },
                          layout: make => {
                            make.height.equalTo(24);
                            make.left.top.right.inset(5);
                          }
                        },
                        {
                          type: "label",
                          props: {
                            id: "subTitle",

                            align: $align.left,
                            font: $font(12),
                            textColor: $color("gray")
                          },
                          layout: make => {
                            make.height.equalTo(40);
                            make.top.left.right.bottom.inset(2);
                            //                            make.top.equalTo($("labelTitle").bottom);
                          }
                        }
                      ]
                    }
                  },
                  layout: $layout.fill
                }
              ]
            },
            data: items.map(item => {
              return {
                title: {
                  text: item.title
                },
                subTitle: {
                  text: item.subTitle
                }
              };
            })
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              handler(indexPath.section, indexPath.row, data);
            }
          }
        }
      ]
    });
  }
}
class UiKit {
  constructor() {}
  showMenu(menuList, handler = idx => {}) {
    $ui.menu({
      items: menuList,
      handler: (title, idx) => {
        handler(idx);
      }
    });
  }
}

module.exports = {
  DateTime,
  ListView,
  UiKit
};
