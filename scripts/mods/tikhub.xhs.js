const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  $ = require("$"),
  ListViewKit = new Next.ListView();
class XHSCore {
  constructor(mod) {
    this.Http = mod.ModuleLoader.getModule("tikhub.http");
  }
  getRealUrl(shortLink) {
    return new Promise((resolve, reject) => {
      if ($.hasString(shortLink)) {
      } else {
        reject();
      }
    });
  }
  getNoteDataById(id) {
    return new Promise((resolve, reject) => {
      if ($.hasString(id)) {
        this.Http.getThen(this.Http.API_HOST + "xhs/get_note_data/", {
          note_id: id
        })
          .then(resp => {
            $console.info(resp);
            const { statusCode } = resp.response;
            const result = resp.data,
              data = result.data;
            $console.info(statusCode);
            if (statusCode === 200 && data.success === true) {
              resolve({
                success: data.success === true,
                message: data.msg
              });
            } else {
              reject({
                success: false,
                httpCode: statusCode,
                code: data.code,
                message: data.msg || result.message || `Http code:${statusCode}`
              });
            }
          })
          .catch(fail => {
            $console.error(fail);
            reject({
              success: false,
              message: fail.message || "fail"
            });
          });
      } else {
        reject({
          success: false,
          message: "need url"
        });
      }
    });
  }
}

class ExampleModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "tikhub.xhs",
      name: "TikHub-小红书",
      version: "1"
      //author: "zhihaofans"
    });
    //this.Mod = mod;
    this.Http = mod.ModuleLoader.getModule("tikhub.http");
    this.XHS = new XHSCore(mod);
  }
  getNoteData(id) {
    return this.XHS.getNoteDataById(id);
  }
}
module.exports = ExampleModule;
