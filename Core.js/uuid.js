class UserUUID {
  constructor(appKernel) {
    this.AppKernel = appKernel;
    this.ICLOUD_DIR = "drive://zhihaofans/";
    this.DATA_DIR = this.ICLOUD_DIR + "Core.js/";
    this.KEYCHAIN_DOMAIN = "zhihaofans.corejs";
    $file.mkdir(this.ICLOUD_DIR);
    $file.mkdir(this.DATA_DIR);
    this.init();
    this.AppLog = new AppLog({
      appKernel: this.AppKernel,
      dataDir: this.DATA_DIR
    });
  }
  init() {
    this.UUID = this.getDeviceUUID();
    this.saveUserData();
  }
  saveUserData() {
    $keychain.set(this.KEYCHAIN_DOMAIN, "uuid", this.UUID);
    $file.write({
      data: $data({ string: this.UUID }),
      path: this.DATA_DIR + "uuid"
    });
    $file.write({
      data: $data({ string: this.UUID }),
      path: this.ICLOUD_DATA_DIR + "uuid"
    });
  }
  getDeviceUUID() {
    const UUID =
      $keychain.get(this.KEYCHAIN_DOMAIN, "uuid") ||
      $file.read(this.DATA_DIR + "uuid") ||
      $text.uuid;
    return UUID;
  }
}
class AppLog {
  constructor({ appKernel, dataDir }) {
    this.AppKernel = appKernel;
    this.DATA_DIR = dataDir;
    this.setLastApp({
      message: `logtime:${new Date().getTime()}`
    });
  }
  setLastApp({ message }) {
    const lastAppLog = {
      appId: this.AppKernel.AppInfo.id,
      appName: this.AppKernel.AppInfo.name,
      timestamp: this.AppKernel.START_TIME,
      message
    };
    $file.write({
      data: $data({ string: JSON.stringify(lastAppLog) }),
      path: this.DATA_DIR + "applog.json"
    });
  }
}

module.exports = {
  UserUUID
};
