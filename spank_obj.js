let spank_obj = {
  // Spankulator functions
  in_settings_fxn: function () {
    return data_handler.data.fxn === "Settings"
  },
  in_wifi_fxn: function () {
    return data_handler.data.fxn === "WiFi"
  },
  in_bounce_fxn: function () {
    return data_handler.data.fxn === "Bounce"
  },
  in_lfo_fxn: function () {
    return data_handler.data.fxn === "LFO"
  },
  in_user_fxn: function () {
    return data_handler.data.fxn === "User"
  },
  find_selected_data: function () {
    if (this.in_user_fxn() && data_handler.data.param_num === "0") {
      dbugger.print("User sequence is selected. Data: " + data_handler.data.sequence)
      return data_handler.data.sequence
    } else {
      return data_handler.find_selected_param()
    }
  },
  get_user_string: function () {
    data_handler.data.sequence.param_num = data_handler.data.param_num
    return data_handler.data.sequence
  },
  param_is_active: function () {
    return data_handler.data.param_active == "1" || this.in_bounce_fxn()
  },
}
