const __VERSION__ = 1;
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
}
class ViewKit {
  constructor({ title, navButtons }) {
    this.TITLE = title;
    this.NAV_BUTTONS = navButtons;
  }
  pushView(views) {
    $ui.push({
      props: {
        title: this.TITLE,
        navButtons: this.NAV_BUTTONS
      },
      views: views,
      events: {
        appeared: function () {
          $app.tips("这是第一次加载完毕会出现的提示");
        },
        shakeDetected: function () {
          //摇一摇￼
          $app.tips("这是摇一摇会出现的提示");
        }
      }
    });
  }
  renderView(views) {
    $ui.render({
      props: {
        id: "main",
        title: this.TITLE,
        homeIndicatorHidden: false,
        modalPresentationStyle: 0,
        navButtons: this.NAV_BUTTONS
      },
      views: views,
      events: {
        appeared: function () {
          $app.tips("这是第一次加载完毕会出现的提示");
        },
        shakeDetected: function () {
          //摇一摇￼
          $app.tips("这是摇一摇会出现的提示");
        }
      }
    });
  }
}
class ListKit extends ViewKit {
  constructor() {
    super({
      title: "ListView",
      navButtons: undefined
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
  pushStringWithLongclick(
    title,
    listData,
    didSelect = (sender, indexPath, data) => {},
    long_click_menu
  ) {
    this.TITLE = title;
    this.pushView([
      {
        type: "list",
        props: {
          autoRowHeight: true,
          estimatedRowHeight: 10,
          data: listData,
          menu: long_click_menu ?? {
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
}

module.exports = {
  __VERSION__,
  ListKit,
  LongClickKit
};
