class Widget {
  constructor() {
    this.INPUT_VALUE = $widget.inputValue;
  }
  setTimeline({ render }) {
    $widget.setTimeline({
      entries: [
        {
          date: new Date(),
          info: {}
        }
      ],
      policy: {
        atEnd: true
      },
      render: ctx => {
        return {
          type: "text",
          props: {
            text: "Hello, World!"
          }
        };
      }
    });
  }
}
module.exports = {
  Widget
};
