const { Core } = require("../../Core.js/core");
class Example extends Core {
  constructor(app) {
    super({
      app,
      modId: "content_box",
      modName: "内容盒子",
      version: "1",
      author: "zhihaofans",
      coreVersion: 5
    });
  }
  run() {}

  runApi({ url, data, callback }) {
    //TODO:允许其他Mod调用
    return false;
  }
}
module.exports = Example;
