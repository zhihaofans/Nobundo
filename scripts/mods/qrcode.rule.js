const { ModModule } = require("CoreJS"),
  $ = require("$");

const RULE_TYPE = {
    link: "rule_link",
    regex: "rule_regex"
  },
  RULE_LIST = {
    douyin: {
      type: RULE_TYPE.link,
      title: "抖音解析",
      func: url => {}
    },
    safari: {
      type: RULE_TYPE.link,
      title: "Safari浏览器",
      func: url => {
        $app.openURL(url);
      }
    },
    rednote: {
      type: RULE_TYPE.regex,
      title: "小红书解析",
      regex_list: [],
      func: url => {}
    }
  };
class RuleParse {
  constructor(mod) {
    this.RULES = Object.keys(RULE_LIST).map(id => {
      const re = RULE_LIST[id];
      return {
        id: id,
        type: re.type,
        title: re.title,
        regex: re.regex,
        func: re.func
      };
    });
  }
  getRules(type) {
    if ($.isEmpty(type)) {
      return this.RULES;
    } else {
      return this.RULES.filter(re => re.type == type);
    }
  }
  parse(text) {
    return new Promise((resolve, reject) => {
      if ($.isEmpty(text)) {
        reject("空白内容");
      } else if ($.isLink(text)) {
        resolve(this.getRules(RULE_TYPE.link));
      } else {
        reject("不支持该内容");
      }
    });
  }
}
class ExampleModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "qrcode.rule",
      name: "二维码规则",
      version: "1"
      //author: "zhihaofans"
    });
    this.RuleParse = new RuleParse(mod);
  }
  parse(text) {
    return this.RuleParse.parse(text);
  }
  showRuleView() {
    const ruleGroupList = this.RuleParse.getRules().map(rule => {
      return {
        title: rule.title,
        rows: [`id:${rule.id}`, `类型:${rule.type}`]
      };
    });
    $console.info(ruleGroupList);
    $ui.push({
      props: {
        title: "规则"
      },
      views: [
        {
          type: "list",
          props: {
            data: ruleGroupList
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              //const { section, row } = indexPath;
            }
          }
        }
      ]
    });
  }
}
module.exports = ExampleModule;
