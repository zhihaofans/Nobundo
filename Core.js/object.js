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

module.exports = {
  Result,
  UserException
};
