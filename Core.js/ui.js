const __VERSION__ = 2;
class LongClickKit {
  constructor(title) {
    this.TITLE = title;
    this.MENU_DEMO = {
      title: "title",
      items: [
        {
          title: "Action 1",
          handler: (sender, indexPath) => {}
        }
      ]
    };
    this.MENU = {
      title: title,
      items: []
    };
  }
  add({ title, handler }) {
    this.MENU.items.push([
      {
        title: title,
        handler: handler
      }
    ]);
  }
  setTitle(new_title) {
    this.TITLE = new_title;
  }
  getData() {
    return this.MENU;
  }
}
class ViewKit {
  constructor({ viewId, title, navButtons }) {
    this.VIEW_ID = viewId;
    this.TITLE = title;
    this.NAV_BUTTONS = navButtons;
  }
  setTitle(newTitle) {
    this.TITLE = newTitle;
  }
  setNavbutton(newNavbutton) {
    this.NAV_BUTTONS = newNavbutton;
  }
  pushView(views) {
    $ui.push({
      props: {
        title: this.TITLE,
        navButtons: this.NAV_BUTTONS
      },
      views,
      events: {
        appeared: () => {
          $app.tips("这是第一次加载完毕会出现的提示");
        },
        shakeDetected: () => {
          //摇一摇￼
          $app.tips("这是摇一摇会出现的提示");
        }
      }
    });
  }
  pushViewNew({ id, views }) {
    $ui.push({
      props: {
        id,
        title: this.TITLE,
        navButtons: this.NAV_BUTTONS
      },
      views,
      events: {
        appeared: () => {
          $app.tips("这是第一次加载完毕会出现的提示");
        },
        shakeDetected: () => {
          //摇一摇￼
          $app.tips("这是摇一摇会出现的提示");
        }
      }
    });
  }
  renderView(views) {
    $ui.render({
      props: {
        id: this.VIEW_ID ?? "main",
        title: this.TITLE,
        homeIndicatorHidden: false,
        modalPresentationStyle: 0,
        navButtons: this.NAV_BUTTONS
      },
      views: views,
      events: {
        appeared: () => {
          $app.tips("这是第一次加载完毕会出现的提示");
        },
        shakeDetected: () => {
          //摇一摇￼
          $app.tips("这是摇一摇会出现的提示");
        }
      }
    });
  }
}
// ListViewKit 为测试功能
class ListViewKit {
  constructor() {
    this.TITLE = "ListView";
  }
  setTitle(newTitle) {
    this.TITLE = newTitle;
  }
  pushViews(views, didSelect = (section, row) => {}) {
    $ui.push({
      props: {
        title: this.TITLE
      },
      views: [
        {
          type: "list",
          props: {
            data: views
          },
          layout: $layout.fill,
          events: {
            didSelect: (_sender, indexPath, _data) => {
              didSelect(indexPath.section, indexPath.row);
            }
          }
        }
      ]
    });
  }
}
class ListKit extends ViewKit {
  constructor() {
    super({
      title: "ListView"
    });
  }

  pushString(title, listData, didSelect = (sender, indexPath, data) => {}) {
    this.TITLE = title;
    this.pushView([
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
    ]);
  }
  // pushIdx() 为测试功能
  pushIdx(title, listData, handler = (section, row) => {}) {
    this.TITLE = title;
    this.pushView([
      {
        type: "list",
        props: {
          autoRowHeight: true,
          estimatedRowHeight: 10,
          data: listData
        },
        layout: $layout.fill,
        events: {
          didSelect: (sender, indexPath, _data) => {
            handler(indexPath.section, indexPath.row);
          }
        }
      }
    ]);
  }
  pushIndex({ id, title, data, handler = (section, row) => {} }) {
    this.TITLE = title;
    this.pushViewNew({
      views: [
        {
          type: "list",
          props: {
            id,
            autoRowHeight: true,
            estimatedRowHeight: 10,
            data
          },
          layout: $layout.fill,
          events: {
            didSelect: (_sender, indexPath, _data) => {
              handler(indexPath.section, indexPath.row);
            }
          }
        }
      ]
    });
  }
  pushStringWithLongclick(
    title,
    listData,
    didSelect = (sender, indexPath, data) => {},
    long_click_kit_data
  ) {
    this.TITLE = title;
    this.pushView([
      {
        type: "list",
        props: {
          autoRowHeight: true,
          estimatedRowHeight: 10,
          data: listData,
          menu: long_click_kit_data.getData() ?? {
            title: "Context Menu",
            items: [
              {
                title: "Action 1",
                handler: (sender, indexPath) => {}
              }
            ]
          }
        },
        layout: $layout.fill,
        events: {
          didSelect: didSelect
        }
      }
    ]);
  }
  renderString(title, listData, didSelect = (sender, indexPath, data) => {}) {
    this.TITLE = title;
    this.renderView([
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
    ]);
  }
  renderIdx(title, listData, _handler = (section, row) => {}) {
    this.TITLE = title;
    this.renderView([
      {
        type: "list",
        props: {
          autoRowHeight: true,
          estimatedRowHeight: 10,
          data: listData
        },
        layout: $layout.fill,
        events: {
          didSelect: (_sender, indexPath, _data) => {
            _handler(indexPath.section, indexPath.row);
          }
        }
      }
    ]);
  }
}
class ImageKit extends ViewKit {
  constructor() {
    super({
      title: "Image"
    });
  }
  showSingleUrlMenu(imageUrl) {
    if (imageUrl) {
      const links = $detector.link(imageUrl);
      let imageLink = imageUrl;
      if (links.length > 1) {
        imageLink = imageUrl[0];
      }
      $ui.menu({
        items: ["用Safari打开", "分享", "快速预览", "网页预览"],
        handler: (title, idx) => {
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
          }
        }
      });
    }
  }
  showMultUrlMenu(urlList) {
    const view_data = [
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
        layout: (make, view) => {
          make.left.right.inset(10);
          make.centerY.equalTo(view.super);
          make.height.equalTo(320);
        }
      }
    ];
    this.pushView(view_data);
  }
}
class InputKit {
  constructor() {
    this.name = "name";
  }
  text({ placeholder, text, handler }) {
    $input.text({
      type: $kbType.text,
      placeholder,
      text,
      handler
    });
  }
}

module.exports = {
  __VERSION__,
  ListKit,
  LongClickKit,
  ImageKit,
  InputKit,
  ListViewKit
};
