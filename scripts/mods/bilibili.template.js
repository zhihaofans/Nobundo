const { ModModule } = require("CoreJS"),
  $ = require("$"),
  colorData = require("../color");

class BiliModule extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "bilibili.template",
      name: "哔哩哔哩界面模板",
      version: "1"
    });
  }
  buttonTemplate({
    id,
    props,
    title,
    layout,
    events,
    tapped,
    titleColor,
    type
  }) {
    return {
      type: "button",
      props: props || {
        id,
        title,
        align: $align.center,
        titleColor,
        type,
        contentEdgeInsets: $insets(10, 10, 10, 10)
      },
      layout,
      events: events || {
        tapped
      }
    };
  }
  imageTemplate({ id, props, src, layout, events, tapped }) {
    return {
      type: "image",
      props: props || {
        id,
        src
      },
      layout,
      events: events || {
        tapped
      }
    };
  }
  labelTemplate({ id, props, text, layout, events, tapped, lines }) {
    return {
      type: "label",
      props: props || {
        id,
        text,
        align: $align.center,
        lines: lines || 1
      },
      layout,
      events: events || {
        tapped
      }
    };
  }
  singlePostTemplate() {
    return {
      props: {
        bgcolor: colorData.videoItemBgcolor
      },
      views: [
        {
          type: "image",
          props: {
            id: "imageFace",
            cornerRadius: 10,
            smoothCorners: true
          },
          layout: (make, view) => {
            //make.centerX.equalTo(view.super);
            make.left.equalTo(5);
            make.top.equalTo(5);
            make.height.width.equalTo(24);
            //make.bottom.equalTo(5)
          }
        },
        {
          type: "label",
          props: {
            id: "labelAuthor",
            align: $align.left,
            font: $font(24),
            lines: 3,
            text: "@",
            textColor: colorData.titleTextColor
          },
          layout: (make, view) => {
            make.left.equalTo($ui.get("imageFace").right).offset(10);
            make.right.equalTo(5);
            make.top.equalTo($ui.get("imageFace").top).offset(-2);
          }
        },
        {
          type: "label",
          props: {
            id: "labelTitle",
            align: $align.left,
            font: $font(16),
            lines: 2,
            textColor: colorData.titleTextColor
          },
          layout: (make, view) => {
            make.top.equalTo($ui.get("labelAuthor").bottom).offset(10);
            make.left.equalTo(5);
            make.right.equalTo(5);
          }
        },
        {
          type: "image",
          props: {
            id: "imageCover"
          },
          layout: (make, view) => {
            //make.centerX.equalTo(view.super);
            make.right.equalTo(-5);
            make.left.equalTo(5);
            make.top.equalTo($ui.get("labelTitle").bottom);
            make.height.equalTo(220);
            //make.bottom.equalTo(5)
          },
          events: {
            ready: sender => {
              if (!$.hasString(sender.src)) {
                sender.hidden = true;
                sender.size = $size(0, 0);
              }
            }
          }
        }
      ]
    };
  }
}
module.exports = BiliModule;
