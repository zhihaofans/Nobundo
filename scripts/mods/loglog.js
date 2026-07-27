const { ModCore, ModuleLoader } = require("CoreJS");
class LogLogView {
  constructor(mod) {
    this.Mod = mod;
    this.Data = mod.ModuleLoader.getModule("loglog.data");
  }
  init() {
    this.Data.init();
    this.initView();
  }
  showEditView(data) {
    new Promise((resolve, reject) => {
      $ui.push({
        props: {
          title: "编辑中"
        },
        views: [
          {
            type: "list",
            props: {
              data: [
                {
                  title: "UUID",
                  rows: [data.id]
                },
                {
                  title: "标题",
                  rows: [data.title]
                },
                {
                  title: "备注",
                  rows: [data.desc]
                },
                {
                  title: "类型",
                  rows: [data.type]
                },
                {
                  title: "分组id",
                  rows: [data.group_id]
                },
                {
                  title: "创建时间",
                  rows: [data.create_time.toString()]
                },
                {
                  title: "最后更新",
                  rows: [data.update_time.toString()]
                }
              ]
            },
            layout: $layout.fill,
            events: {
              didSelect: (sender, indexPath, data) => {
                const { section, row } = indexPath;
              }
            }
          }
        ]
      });
    });
  }
  initView() {
    let logs = [];
    $ui.push({
      props: {
        title: "加载中"
      },
      views: [
        {
          type: "list",
          props: {
            id: "list_logs",
            data: logs
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const { section, row } = indexPath;
              this.showEditView(logs[row]);
            },
            ready: sender => {
              $ui.loading(true);
              this.Data.Core.loadData()
                .then(data => {
                  $console.info("loadData.then");
                  $console.info(data);
                  logs = data;
                  $ui.get("list_logs").data = logs.map(it => it.title);
                  $ui.title = `记一下(${data.length})`;
                  $ui.loading(false);
                })
                .catch(err => {
                  $ui.loading(false);
                  $ui.alert({
                    title: "加载失败",
                    message: err,
                    actions: [
                      {
                        title: "OK",
                        disabled: false, // Optional
                        handler: () => {}
                      },
                      {
                        title: "Cancel",
                        handler: () => {}
                      }
                    ]
                  });
                });
            }
          }
        }
      ]
    });
  }
}
class Example extends ModCore {
  constructor(app) {
    super({
      app,
      modId: "loglog",
      modName: "记一下",
      version: "1",
      author: "zhihaofans",
      coreVersion: 20,
      useSqlite: false,
      allowWidget: false,
      allowApi: false,
      iconName: "pencil"
    });
    this.ModuleLoader = new ModuleLoader(this);
    this.ModuleLoader.addModule("loglog.data.js");
  }
  run() {
    try {
      new LogLogView(this).init();
    } catch (error) {
      $console.error(error);
    }
    //$ui.success("run");
  }
  runWidget(widgetId) {
    $widget.setTimeline({
      render: ctx => {
        return {
          type: "text",
          props: {
            text: widgetId || "Hello!"
          }
        };
      }
    });
  }
  runApi({ apiId, data, callback }) {
    $console.info({
      apiId,
      data,
      callback
    });
    switch (apiId) {
      case "example.ui":
        this.ModuleLoader.getModule("example.ui").initUi();

        break;
      default:
    }
  }
}
module.exports = Example;
