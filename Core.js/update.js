const lib = require("./lib"),
  default_data = require("./default"),
  __VERSION__ = 1;
class Updater {
  constructor(useragent) {
    this.USER_AGENT = useragent ?? default_data.http.user_agent;
    this.HTTP = new lib.Http({
      timeout: 5,
      useragent: this.USER_AGENT
    });
  }
  checkVersion(old_ver, new_ver) {
    return old_ver !== new_ver;
  }
  downloadUpdate(url, file_path) {
    this.HTTP.download(
      url,
      resp => {
        $share.sheet(resp.data);
      },
      (bytesWritten, totalBytes) => {
        const percentage = (bytesWritten * 1.0) / totalBytes;
        $console.info(`downloaded:${percentage}`);
      }
    );
  }
}

class CoreUpdater extends Updater {
  constructor(name) {
    super();
    this.NAME = name;
  }
}
module.exports = {
  __VERSION__
};
