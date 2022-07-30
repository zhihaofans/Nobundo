const { ModCore } = require("../../Core.js/core");
class ChineseZodiacCore {
  constructor(mod) {
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
  }
}

class ChineseZodiac extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "chinese_zodiac",
      modName: "十二生肖",
      version: "1",
      author: "zhihaofans",
      coreVersion: 6,
      useSqlite: false
    });
    this.core = new ChineseZodiacCore(this);
  }
  run() {
    //    $ui.success("run");
    this.showAnimalList();
  }
  showAnimalList() {
    $ui.push({
      props: {
        title: this.MOD_INFO.NAME
      },
      views: [
        {
          type: "list",
          props: {
            data: this.core.ANIMAL_LIST
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const section = indexPath.section,
                row = indexPath.row;
            }
          }
        }
      ]
    });
  }
}
module.exports = ChineseZodiac;
