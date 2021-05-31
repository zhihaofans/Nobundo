const { Kernel } = require("../Core.js/kernel");
class AppKernel extends Kernel {
  constructor() {
    super();
    this.registerCoreMod();
  }
  init() {}
}

module.exports = {};
