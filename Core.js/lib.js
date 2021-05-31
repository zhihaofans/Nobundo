class Http {
  constructor({ timeout = 5, useragent }) {
    this.TIMEOUT = timeout;
    this.USER_AGENT = useragent;
  }
  async get(url, header) {
    const new_header = header ?? {};
    header["User-Agent"] = this.USER_AGENT;
    const result = await $http.get({
      url: url,
      timeout: this.TIMEOUT,
      header: new_header
    });
    return url ? result : undefined;
  }
  async post(url, postBody, header) {
    const new_header = header ?? {};
    header["User-Agent"] = this.USER_AGENT;
    const result = await $http.post({
      url: url,
      header: new_header,
      timeout: this.TIMEOUT,
      body: postBody
    });
    return url ? result : undefined;
  }
  download(url, handler, progress) {
    $http.download({
      url: url,
      showsProgress: true, // Optional, default is true
      backgroundFetch: true, // Optional, default is false
      progress: progress,
      handler: handler
    });
  }
}
module.exports = {
  Http
};
