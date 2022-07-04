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
    return `${this.DATE_TIME.getFullYear()}-${
      this.DATE_TIME.getMonth() + 1
    }-${this.DATE_TIME.getDate()}`;
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
                  clickItem.func();
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
