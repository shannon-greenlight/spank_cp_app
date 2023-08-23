device = {
  type: "Spankulator",
  title: "Spankulator Control Panel v3.0",
  port_label: "Arduino NANO 33 IoT",
  take_snapshot: function (data, out) {
    return out
  },
  receive_data: function () {
    // does nothing
  },
  receive_status: function () {
    trigger_on_button.set(data_handler.status.triggered)
    trigger_button.set(data_handler.status.gate)
    tog_button.set(data_handler.status.toggle)
  },
}
