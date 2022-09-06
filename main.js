try {
  let allLibNotNeedUpdate = true;
  const libCheckResult = libVersionCheck();
  $console.info(libCheckResult);
  Object.keys(libCheckResult).map(libId => {
    if (libCheckResult[libId] == false) {
      allLibNotNeedUpdate = false;
    }
  });
  if (allLibNotNeedUpdate == true) {
    require("./scripts/app").run();
  } else {
    $ui.alert({
      title: "外部库需要更新",
      message: JSON.stringify(libCheckResult),
      actions: [
        {
          title: "Exit",
          disabled: false, // Optional
          handler: () => {
            $app.close();
          }
        }
      ]
    });
  }
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
function libVersionCheck() {
  const libList = { CoreJS: 9, $: 1, Next: 1 },
    checkResult = {};
  Object.keys(libList).map(libId => {
    const lib = require(libId);
    if (lib == undefined) {
      checkResult[libId] = false;
    } else {
      checkResult[libId] = lib.VERSION == libList[libId];
    }
  });
  return checkResult;
}
