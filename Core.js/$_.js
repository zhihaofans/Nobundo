const __VERSION__ = 7;
// File
class Console {
  auto(success = true, message) {
    success ? $console.info(message) : $console.error(message);
  }
}
// File
class File {
  constructor(icloud) {
    this.IS_ICLOUD = icloud ?? false;
  }
  setIsIcloud(is_icloud) {
    this.IS_ICLOUD = is_icloud === true;
  }
  open(handler, types) {
    $drive.open({
      handler: handler,
      types: types
    });
  }
  save(name, data, handler) {
    $drive.save({
      data: data,
      name: name,
      handler: handler
    });
  }
  isDirectory(path) {
    if (!this.isExists(path)) {
      return false;
    }
    return this.IS_ICLOUD ? $drive.isDirectory(path) : $file.isDirectory(path);
  }
  isExists(path) {
    return path && this.IS_ICLOUD ? $drive.exists(path) : $file.exists(path);
  }
  ifFile(path) {
    return this.isExists(path) && !this.isDirectory(path);
  }
  getFileList(dir, ext = undefined) {
    if ($file.exists(dir) && $file.isDirectory(dir)) {
      let files = [];
      const fileList = $file.list(dir);
      fileList.map(f => {
        if (!$file.isDirectory(f)) {
          if (ext) {
            if (f.endsWith(`.${ext}`)) {
              files.push(f);
            }
          } else {
            files.push(f);
          }
        }
      });
      return files;
    } else {
      $console.error(`不存在该目录或不是目录:${dir}`);
      return undefined;
    }
  }
  readLocal(path) {
    return this.isFile(path) ? $file.read(path) : undefined;
  }
  readIcloud(path) {
    return this.isFile(path) ? $drive.read(path) : undefined;
  }
  read(path) {
    return this.IS_ICLOUD ? this.readIcloud(path) : this.readLocal;
  }
  write(path, data) {
    return this.IS_ICLOUD
      ? $drive.write({
          data: data,
          path: path
        })
      : $file.write({
          data: data,
          path: path
        });
  }
  absolutePath(path) {
    return this.IS_ICLOUD
      ? $drive.absolutePath(path)
      : $file.absolutePath(path);
  }
  getDirByFile(path) {
    if (this.isDirectory(path)) {
      return path;
    }
    if (this.isFile(path)) {
      const dir_path_end = path.lastIndexOf("/");
      if (dir_path_end >= 0) {
        return path.slice(0, dir_path_end + 1);
      }
    }
    return undefined;
  }
}
// Http
class Http {
  constructor(timeout = 5) {
    this.TIMEOUT = timeout;
  }
  async get(url, header) {
    const result = await $http.get({
      url: url,
      timeout: this.TIMEOUT,
      header: header
    });
    return url ? result : undefined;
  }
  async post(url, postBody, header = undefined) {
    const result = await $http.post({
      url: url,
      header: header,
      timeout: this.TIMEOUT,
      body: postBody
    });
    return url ? result : undefined;
  }
  cookieToObj(cookie) {
    if (cookie) {
      const cookie_obj = {};
      cookie.split(";").map(cookie_item => {
        const item_split = cookie_item.split("=");
        cookie_item[item_split[0]] = item_split[1];
      });
      return cookie_obj;
    } else {
      return undefined;
    }
  }
}
// Notify
class Notify {
  default(title = "标题", body = "内容", mute = true) {
    $push.schedule({
      title: title,
      body: body,
      mute: mute
    });
  }
}
// Share
class Share {
  isAction() {
    return $app.env == $env.action;
  }
  isSafari() {
    return $app.env == $env.safari;
  }
  isActionOrSafari() {
    return Share.isAction() || Share.isSafari();
  }
  getImage() {
    if (Share.isAction()) {
      return $context.image || undefined;
    }
    return undefined;
  }
  getText() {
    if (Share.isAction()) {
      return $context.text || undefined;
    }
    if (Share.isSafari()) {
      return $context.safari.title || undefined;
    }
    return undefined;
  }
  getLink() {
    if (Share.isAction()) {
      return $context.link || undefined;
    }
    if (Share.isSafari()) {
      return $context.safari ? $context.safari.items.location.href : undefined;
    }
    return undefined;
  }
  getLinks() {
    if (Share.isAction()) {
      return $context.linkItems || undefined;
    }
    if (Share.isSafari()) {
      return $context.safari
        ? [$context.safari.items.location.href]
        : undefined;
    }
    return undefined;
  }
}
// Str
class Str {
  copy(str) {
    $clipboard.copy({
      text: str,
      ttl: 30,
      locally: true
    });
  }
  paste() {
    return $clipboard.text || "";
  }
  toQrcode(str) {
    return $qrcode.encode(str);
  }
  fromQrcode(qrcode) {
    return $qrcode.decode(qrcode);
  }
  toJson(str) {
    return JSON.parse(str);
  }
  fromJson(json) {
    return JSON.stringify(json);
  }
  getListFromL10n(sourceList) {
    return sourceList ? sourceList.map(x => $l10n(x)) : [];
  }
}
// Time
class Time {
  getUnixTime() {
    return new Date().getTime();
  }
  getSecondUnixTime() {
    return Math.round(new Date().getTime() / 1000);
  }
  toLocaltime(ISO8601, timezone = "Asia/Shanghai") {
    const moment = require("moment");
    return moment(ISO8601).tz(timezone).format("YYYY-MM-DD hh:mm:ss");
  }
}
// View
class View {
  constructor() {
    this.List = {
      push: (title, listData, didSelect) => {
        $ui.push({
          props: {
            title: title
          },
          views: [
            {
              type: "list",
              props: {
                autoRowHeight: true,
                estimatedRowHeight: 10,
                data: listData
              },
              layout: $layout.fill,
              events: {
                didSelect: didSelect
              }
            }
          ]
        });
      }
    };
    this.Image = {
      showSingleMenu: imageUrl => {
        if (imageUrl) {
          const links = $detector.link(imageUrl);
          let imageLink = imageUrl;
          if (links.length > 1) {
            imageLink = imageUrl[0];
          }
          $ui.menu({
            items: ["用Safari打开", "分享", "快速预览", "网页预览"],
            handler: function (title, idx) {
              switch (idx) {
                case 0:
                  $app.openURL(imageLink);
                  break;
                case 1:
                  $share.sheet([imageLink]);
                  break;
                case 2:
                  $quicklook.open({
                    url: imageLink,
                    handler: function () {
                      $console.info(imageLink);
                    }
                  });
                  break;
                case 3:
                  $ui.preview({
                    title: title,
                    url: imageLink
                  });
                  break;
                default:
                  return;
              }
            }
          });
        } else {
          return;
        }
      },
      ShowMultGallery: urlList => {
        $ui.push({
          props: {
            title: ""
          },
          views: [
            {
              type: "gallery",
              props: {
                items: urlList.map(u => ({
                  type: "image",
                  props: {
                    src: u
                  }
                })),
                interval: 3,
                radius: 5.0
              },
              layout: function (make, view) {
                make.left.right.inset(10);
                make.centerY.equalTo(view.super);
                make.height.equalTo(320);
              }
            }
          ]
        });
      }
    };
  }
}
module.exports = {
  __VERSION__,
  Console,
  File,
  Http,
  Notify,
  Share,
  Str,
  Time,
  View
};
