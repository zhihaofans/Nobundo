try {
  require("./scripts/app").run();
} catch (error) {
  $console.error(error);
  $ui.alert({
    title: error.name,
    message: error.message,
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
