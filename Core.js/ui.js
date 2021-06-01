class ListKit {
  push(title, listData, didSelect) {
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
  render(title, listData, didSelect) {
    $ui.render({
      props: {
        id: "main",
        title: title,
        homeIndicatorHidden: false,
        modalPresentationStyle: 0,
        navButtons: undefined
      },
      views: [
        {
          type: "list",
          props: {
            data: []
          },
          layout: $layout.fill,
          events: {
            didSelect: function (_sender, indexPath, _data) {}
          }
        }
      ],
      events: {
        appeared: function () {
          $app.tips("右上角的按钮是更新按钮，摇一摇设备也可以触发检测更新");
        },
        shakeDetected: function () {
          //摇一摇
        }
      }
    });
  }
}
module.exports = {
    ListKit
};
