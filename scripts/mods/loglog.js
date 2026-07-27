const { ModCore, ModuleLoader } = require("CoreJS");
const $ = require("$");
class EditView {
  constructor(create_mode) {
    this.create_mode = create_mode == true;
    this.Item;
  }
  loadListData() {
    const data = [
      {
        title: "UUID",
        rows: [this.Item.id]
      },
      {
        title: "标题",
        rows: [this.Item.title]
      },
      {
        title: "备注",
        rows: [this.Item.desc]
      },
      {
        title: "类型",
        rows: [this.Item.type]
      },
      {
        title: "分组id",
        rows: [this.Item.group_id]
      },
      {
        title: "创建时间",
        rows: [this.Item.create_time.toString()]
      },
      {
        title: "最后更新",
        rows: [this.Item.update_time.toString()]
      }
    ];
    $ui.get("list_edit").data = data;
  }
  editStrItem(name, value) {
    return new Promise((resolve, reject) => {
      $input.text({
        type: $kbType.text,
        placeholder: name,
        text: value,
        handler: text => {
          resolve(text);
        }
      });
    });
  }
  showEditView(data) {
    this.Item = data;
    return new Promise((resolve, reject) => {
      $ui.push({
        props: {
          title: (this.create_mode ? "新建" : "编辑") + "中，点击保存➡️",
          navButtons: [
            {
              title: "Save",

              symbol: "tray.and.arrow.down.fill",
              handler: sender => {
                this.Item.update_time = $.getUnixTime();
                resolve(this.Item);
                $ui.pop();
              }
            }
          ]
        },
        views: [
          {
            type: "list",
            props: {
              id: "list_edit",
              data: []
            },
            layout: $layout.fill,
            events: {
              ready: sender => {
                this.loadListData();
              },
              didSelect: (sender, indexPath, data) => {
                const { section, row } = indexPath;
                switch (section) {
                  case 1:
                    this.editStrItem("标题", this.Item.title).then(newValue => {
                      this.Item.title = newValue;
                      this.loadListData();
                    });
                    break;
                  case 2:
                    this.editStrItem("备注", this.Item.desc).then(newValue => {
                      this.Item.desc = newValue;
                      this.loadListData();
                    });
                    break;
                  default:
                }
              }
            }
          }
        ]
      });
    });
  }
}
class LogLogView {
  constructor(mod) {
    this.Mod = mod;
    this.Data = mod.ModuleLoader.getModule("loglog.data");
    this.logs = [];
  }
  init() {
    this.Data.init();
    this.initView();
  }
  createNewItem() {
    const item = this.Data.getNewItem({
      title: "新建文本",
      desc: "暂时只支持文本类型",
      group_id: "default_group"
    });
    new EditView(true).showEditView(item).then(data => {
      this.logs.push(data);
      this.Data.Core.saveLogData(this.logs);
      this.loadListData();
    });
  }
  initView() {
    $ui.push({
      props: {
        title: "加载中",
        navButtons: [
          {
            title: "新建",
            //image, // Optional
            //icon: "024", // Or you can use icon name
            symbol: "pencil.and.outline", // SF symbols are supported
            handler: sender => {
              this.createNewItem();
            },
            menu: {
              title: "Context Menu",
              items: [
                {
                  title: "Title",
                  handler: sender => {}
                }
              ]
            } // Pull-Down menu
          }
        ]
      },
      views: [
        {
          type: "list",
          props: {
            id: "list_logs",
            data: this.logs
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const { section, row } = indexPath;
              new EditView().showEditView(this.logs[row]).then(newItem => {
                this.logs[row] = newItem;
                this.Data.Core.saveLogData(this.logs);
                this.loadListData();
              });
            },
            ready: sender => {
              this.loadListData();
            }
          }
        }
      ]
    });
  }
  loadListData() {
    $ui.loading(true);
    this.Data.Core.loadData()
      .then(data => {
        $console.info("loadData.then");
        $console.info(data);
        this.logs = data;
        $ui.get("list_logs").data = this.logs.map(it => it.title);
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
