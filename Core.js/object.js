const __VERSION__ = 1;
class Result {
  constructor({ success, code, data, error_message }) {
    this.success = success ?? false;
    this.data = data;
    this.code = code ?? -1;
    this.error_message = success ? undefined : error_message;
  }
}
class UserException {
  constructor({ name, message, source }) {
    this.name = name ?? "UserException";
    this.message = message ?? "";
    this.source = source ?? "user";
  }
}
class VersionException {
  constructor({ name, message, source, nowVersion, needVersion }) {
    this.name = name || "VersionException";
    this.message = message || "";
    this.source = source || "Developer";
    this.now_version = nowVersion;
    this.need_version = needVersion;
  }
}
module.exports = {
  __VERSION__,
  Result,
  UserException,
  VersionException
};
