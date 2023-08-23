class Button {
  constructor(id, active_color) {
    this.id = id
    this.active_color = active_color
  }

  set(data) {
    $(`#${this.id}`).css("background-color", data === "ON" ? this.active_color : "#aaa")
  }
}

const repeat_on_button = new Button("repeat_on", "#fbd310")
const trigger_on_button = new Button("trigger_on", "red")
const trigger_button = new Button("trigger_button", "green")
const tog_button = new Button("tog_button", "blue")
