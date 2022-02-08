try {
  require("./scripts/app").run();
} catch (error) {
  $console.error(error);
  $ui.alert({
    title: "app.run error",
    message: { name: error.name, message: error.message },
    actions: [
      {
        title: "EXIT",
        disabled: false, // Optional
        handler: () => {
          $app.close();
        }
      }
    ]
  });
}
