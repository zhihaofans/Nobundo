try {
  require("./scripts/app").run();
} catch (error) {
  $console.error(error);
  $ui.alert({
    title: "app.run error",
    message: `[${error.name}]${error.message}`,
    actions: [
      {
        title: "EXIT",
        disabled: false, // Optional
        handler: function () {
          $app.close();
        }
      }
    ]
  });
}
