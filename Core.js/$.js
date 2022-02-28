const version = "1",
  alert = {
    show: ({ title, message }) => {
      $ui.alert({
        title,
        message
      });
    }
  },
  file = {
    isFile: filePath => {
      return !$file.isDirectory(filePath);
    },
    isFileExist: filePath => {
      return $file.exists(filePath) && !$file.isDirectory(filePath);
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
    getCookiesStrFromObj: cookiesObj => {
      let cookiesStr = "";
      Object.keys(cookiesObj).map(key => {
        cookiesStr += key + "=" + cookiesObj[key] + ";";
      });
      return cookiesStr;
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
    },
    getText: () => {
      return $context.text;
    }
  },
  time = {
    getUnixTime: () => {
      return new Date().getTime();
    },
    getSecondUnixTime: () => {
      return Math.round(new Date().getTime() / 1000);
    },
    getTodayWhatTimeDate: ({ hours, minutes, seconds, milliseconds }) => {
      const nowDate = new Date(),
        todayYear = nowDate.getFullYear(),
        todayMonth = nowDate.getMonth() + 1,
        todayDate = nowDate.getDate();
      return new Date(
        todayYear,
        todayMonth - 1,
        todayDate,
        hours || 0,
        minutes || 0,
        seconds || 0,
        milliseconds || 0
      );
    },
    getTomorrowWhatTimeDate: ({ hours, minutes, seconds, milliseconds }) => {
      const nowDate = new Date(),
        todayYear = nowDate.getFullYear(),
        todayMonth = nowDate.getMonth() + 1,
        todayDate = nowDate.getDate();
      return new Date(
        todayYear,
        todayMonth - 1,
        todayDate + 1,
        hours || 0,
        minutes || 0,
        seconds || 0,
        milliseconds || 0
      );
    },
    pickDate: async () => {
      return await $picker.date({ props: { mode: 1 } });
    },
    pickTime: async () => {
      return await $picker.date({ props: { mode: 0 } });
    },
    pickDateAndTime: async () => {
      return await $picker.date({ props: { mode: 2 } });
    }
  };
module.exports = {
  version,
  alert,
  getUUID: () => {
    return $text.uuid;
  },
  file,
  http,
  share,
  time
};
