const http = {
  get: async ({ url, header, timeout }) => {
    return await $http.get({
      url: url,
      timeout: timeout,
      header: header
    });
  },
  getObjFromCookies: cookies => {
    if (cookies) {
      const cookieResult = {};
      cookies.split(";").map(cookieItem => {
        const itemSplit = cookieItem.trim().split("="),
          itemKey = itemSplit[0],
          itemValve = itemSplit[1];

        cookieResult[itemKey] = itemValve;
      });
      return cookieResult;
    } else {
      return undefined;
    }
  },
  post: async ({ url, header, timeout, body }) => {
    return await $http.post({
      url: url,
      header: header,
      timeout: timeout,
      body: body
    });
  }
};
module.exports = { http };
