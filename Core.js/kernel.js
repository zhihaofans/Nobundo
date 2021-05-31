const __VERSION__ = 1;
class Kernel {
  constructor(name) {
    this.NAME = name;
    this.REG_CORE_MOD_LIST = [];
  }
  registerCoreMod(mod_info) {
    this.REG_CORE_MOD_LIST.push(mod_info);
  }
pushCoreModListView(){
  
}
}
module.exports = {
  __VERSION__,
  Kernel
};
