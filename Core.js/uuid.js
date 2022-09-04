class UserUUID {
  constructor(app) {
    this.App = app;
    this.DATA_DIR = this.App.DATA_DIR.ICLOUD;
    this.KEYCHAIN_DOMAIN = "zhihaofans.corejs";
    this.init();
    this.AppLog = new AppLog({
      app: this.App,
      dataDir: this.DATA_DIR
    });
  }
  init() {
    this.UUID = this.getDeviceUUID();
    this.saveUserData();
  }
  saveUserData() {
    $keychain.set(this.KEYCHAIN_DOMAIN, "uuid", this.UUID);
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
  constructor({ app, dataDir }) {
    this.App = app;
    this.DATA_DIR = dataDir;
    this.setLastApp({
      message: `logtime:${new Date().getTime()}`
    });
  }
  setLastApp({ message }) {
    const lastAppLog = {
      appId: this.App.AppInfo.id,
      appName: this.App.AppInfo.name,
      timestamp: this.App.START_TIME,
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
