const { Kernel } = require("../Core.js/kernel");
class AppKernel extends Kernel {
  constructor() {
    super();
    this.l10n(require("../strings/l10n"));
  }
  init() {}
}

module.exports = {};
