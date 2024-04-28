// Important!!! For Electron development. Mac and Win must be developed in separate environments.
// Not doing this will clobber development system. Fixed by deleting @module from node_modules. (@serial_port)

device = {
  type: "Spankulator",
  title: "Spankulator Control Panel v3.0.2",
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
