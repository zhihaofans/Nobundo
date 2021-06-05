//JSBoxDialogs: https://github.com/Gandum2077/jsbox-dialogs

//UIAlert
const UIAlertActionStyle = {
    Default: 0,
    Cancel: 1,
    Destructive: 2
  },
  UIAlertControllerStyle = {
    ActionSheet: 0,
    Alert: 1
  };
class UIAlertAction {
  constructor(title, style = UIAlertActionStyle.Default, handler) {
    this.title = title;
    this.style = style;
    this.instance = $objc("UIAlertAction").$actionWithTitle_style_handler(
      title,
      style,
      $block("void, UIAlertAction *", () => {
        if (handler) {
          handler(this);
        }
      })
    );
  }
}

class UIAlertController {
  constructor(title, message, style = UIAlertControllerStyle.ActionSheet) {
    this.title = title;
    this.message = message;
    this.style = style;
    this.instance = $objc(
      "UIAlertController"
    ).$alertControllerWithTitle_message_preferredStyle(title, message, style);
  }
  addAction(action) {
    this.instance.$addAction(action.instance);
  }
  addTextField(options) {
    this.instance.$addTextFieldWithConfigurationHandler(
      $block("void, UITextField *", textField => {
        textField.$setClearButtonMode(1);

        if (options.type) {
          textField.$setKeyboardType(options.type);
        }
        if (options.placeholder) {
          textField.$setPlaceholder(options.placeholder);
        }
        if (options.text) {
          textField.$setText(options.text);
        }
        if (options.textColor) {
          textField.$setTextColor(options.textColor.ocValue());
        }
        if (options.font) {
          textField.$setFont(options.font.ocValue());
        }
        if (options.align) {
          textField.$setTextAlignment(options.align);
        }
        if (options.secure) {
          textField.$setSecureTextEntry(true);
        }
        if (options.events) {
          const events = options.events;
          textField.$setDelegate(
            $delegate({
              type: "UITextFieldDelegate",
              events: {
                "textFieldShouldReturn:": textField => {
                  if (events.shouldReturn) {
                    return events.shouldReturn();
                  } else {
                    return true;
                  }
                }
              }
            })
          );
        }
      })
    );
  }
  getText(index) {
    const textField = this.instance.$textFields().$objectAtIndex(index);
    const text = textField.$text();
    return text.jsValue();
  }
  present() {
    this.instance.$show();
  }
}
//Alert
function plainAlert({
  title = "",
  message,
  cancelText = $l10n("CANCEL"),
  confirmText = $l10n("OK")
} = {}) {
  return new Promise((resolve, reject) => {
    const alertVC = new UIAlertController(
      title,
      message,
      UIAlertControllerStyle.Alert
    );
    alertVC.addAction(
      new UIAlertAction(cancelText, UIAlertActionStyle.Destructive, cancelEvent)
    );
    alertVC.addAction(
      new UIAlertAction(confirmText, UIAlertActionStyle.Default, confirmEvent)
    );
    alertVC.present();

    function confirmEvent() {
      resolve("ok");
    }

    function cancelEvent() {
      reject("cancel");
    }
  });
}

function inputAlert({
  title = "",
  message,
  text = "",
  placeholder,
  type = 0,
  cancelText = $l10n("CANCEL"),
  confirmText = $l10n("OK")
} = {}) {
  return new Promise((resolve, reject) => {
    const alertVC = new UIAlertController(
      title,
      message,
      UIAlertControllerStyle.Alert
    );
    alertVC.addTextField({
      placeholder,
      text,
      type,
      events: {
        shouldReturn: () => {
          const input = alertVC.getText(0);
          const isValid = input.length > 0;
          return isValid;
        }
      }
    });
    alertVC.addAction(
      new UIAlertAction(cancelText, UIAlertActionStyle.Destructive, cancelEvent)
    );
    alertVC.addAction(
      new UIAlertAction(confirmText, UIAlertActionStyle.Default, confirmEvent)
    );
    alertVC.present();

    function confirmEvent() {
      const input = alertVC.getText(0);
      resolve(input);
    }

    function cancelEvent() {
      reject("cancel");
    }
  });
}

function loginAlert({
  title = "",
  message,
  placeholder1 = "placeholder1",
  placeholder2 = "placeholder2",
  cancelText = $l10n("CANCEL"),
  confirmText = $l10n("OK")
} = {}) {
  return new Promise((resolve, reject) => {
    const alertVC = new UIAlertController(
      title,
      message,
      UIAlertControllerStyle.Alert
    );
    alertVC.addTextField({
      placeholder: placeholder1
    });
    alertVC.addTextField({
      placeholder: placeholder2,
      secure: true,
      events: {
        shouldReturn: () => {
          const username = alertVC.getText(0);
          const password = alertVC.getText(1);
          const isValid = username.length > 0 && password.length > 0;
          return isValid;
        }
      }
    });
    alertVC.addAction(
      new UIAlertAction(cancelText, UIAlertActionStyle.Destructive, cancelEvent)
    );
    alertVC.addAction(
      new UIAlertAction(confirmText, UIAlertActionStyle.Default, confirmEvent)
    );
    alertVC.present();

    function confirmEvent() {
      const username = alertVC.getText(0);
      const password = alertVC.getText(1);
      resolve({
        username,
        password
      });
    }

    function cancelEvent() {
      reject("cancel");
    }
  });
}
//Usage
const showPlainAlert = async (
    title,
    message,
    confirmText = undefined,
    cancelText = undefined
  ) => {
    return await plainAlert({
      title: title,
      message: message,
      confirmText: confirmText,
      cancelText: cancelText
    });
  },
  showInputAlert = async (
    title,
    message = "",
    text = "",
    confirmText = undefined,
    cancelText = undefined
  ) => {
    return await inputAlert({
      title: title,
      message: message,
      text: text,
      confirmText: confirmText,
      cancelText: cancelText
    });
  },
  showLoginAlert = async (
    title,
    message = undefined,
    usernamePlaceholder = undefined,
    passwordPlaceholder = undefined,
    confirmText = undefined,
    cancelText = undefined
  ) => {
    return await loginAlert({
      title: title,
      message: message,
      placeholder1: usernamePlaceholder,
      placeholder2: passwordPlaceholder,
      confirmText: confirmText,
      cancelText: cancelText
    });
  };
module.exports = {
  plainAlert,
  showPlainAlert,
  inputAlert,
  showInputAlert,
  loginAlert,
  showLoginAlert
};
