const alert = {
    show: ({ title, message }) => {
      $ui.alert({
        title,
        message
      });
    }
  },
  http = {
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
    head: async ({ url, header, timeout }) => {
      return await $http.request({
        method: "HEAD",
        url: url,
        timeout: timeout,
        header: header
      });
    },
    post: async ({ url, header, timeout, body }) => {
      return await $http.post({
        url: url,
        header: header,
        timeout: timeout,
        body: body
      });
    }
  },
  share = {
    isAction: () => {
      return $app.env == $env.action;
    },
    isSafari: () => {
      return $app.env == $env.safari;
    },
    getLink: () => {
      if (share.isAction()) {
        return $context.link || undefined;
      }
      if (share.isSafari()) {
        return $context.safari
          ? $context.safari.items.location.href
          : undefined;
      }
      return undefined;
    }
  },
  time = {
    getUnixTime: () => {
      return new Date().getTime();
    },
    getSecondUnixTime: () => {
      return Math.round(new Date().getTime() / 1000);
    }
  };
module.exports = {
  alert,
  getUUID: () => {
    return $text.uuid;
  },
  http,
  share,
  time
};
