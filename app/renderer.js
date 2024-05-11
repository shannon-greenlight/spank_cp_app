$ = jQuery

let snapshot = ""

const out_fs = 128 / 12
const out_offset = out_fs / 2
let cmd_buttons
// let legal_values
const cv_offset = 5.4
const zeroPad = (num, places) => String(num).padStart(places, "0")

function widget() {
  $ = jQuery
  data_handler.render_device_name()

  const activate_button = $("#activate_button")
  if (common_obj.param_is_active()) {
    activate_button.fadeIn()
  } else {
    activate_button.fadeOut()
  }

  $("#param_label").html(data_handler.data.fxn + " Parameters")
  $("#input_div .param_div").append('<div id="param_value" class="param"></div>')

  repeat_on_button.set(data_handler.data.repeat_on)
  trigger_on_button.set(data_handler.data.triggered)
  trigger_button.set(data_handler.data.gate)
  tog_button.set(data_handler.data.toggle)

  $("#ext_trig_button")
    .html(data_handler.data.ext_trigger_disable)
    .css("background-color", data_handler.data.ext_trigger_disable === "enabled" ? "Green" : "#aaa")
  $("#clk_button")
    .html(data_handler.data.clock)
    .css("background-color", data_handler.data.clock === "internal" ? "Green" : "orange")
  $("#analog_label").html(data_handler.data.quantized)

  let controls = ""
  if (common_obj.in_user_fxn()) {
    controls += data_handler.display_param(common_obj.get_user_string())
    legal_values = data_handler.data.sequence.legal_values
  }
  if (data_handler.data.message && !common_obj.in_user_fxn()) {
    meas_div.show()
    if (common_obj.in_lfo_fxn()) {
      the_canvas.show()
      $("#message_div").hide()
      waveform_obj.draw_waveform()
    } else {
      the_canvas.hide()
      $("#message_div").html(data_handler.data.message).show()
    }
  } else {
    meas_div.hide()
  }
  if (common_obj.in_bounce_fxn()) {
    $("#message_div").addClass("bounce_message")
  } else {
    $("#message_div").removeClass("bounce_message")
  }

  if (common_obj.in_wifi_fxn() || common_obj.in_settings_fxn()) {
    $("#adj_controls, #trigger_controls").hide()
  } else {
    $("#adj_controls, #trigger_controls").show()
  }

  $("#params").html(data_handler.display_params(controls))

  $(".slider_input_div").each(function (indx) {
    const item = $(this).attr("item")
    const item_max = data_handler.data[$(this).attr("max")]
    const item_val = data_handler.data[item]
    const slider_item = $(`#${item}_slider`)
    const input_item = $(`#${item}`)
    const item_slider = $(`#${item}_slider`)
    if (data_handler.data[item] === "disabled") {
      // slider_item.prop("disabled", true)
      $(this).css("visibility", "hidden")
      slider_item.css("visibility", "hidden")
    } else {
      // dbugger.print(`Item: ${item} val: ${item_val}`, true)
      // console.log(item_slider)
      // slider_item.prop("disabled", false).attr("max", item_max)
      $(this).css("visibility", "visible")
      slider_item.css("visibility", "visible")
      item_slider.val(item_val)
      switch (item) {
        case "scale":
          input_item.val(Math.round((100 * item_val) / item_max))
          break
        case "offset":
        case "cv_val":
          input_item.val(((out_fs * item_val) / item_max - out_offset).toFixed(2))
          break
      }
    }
  })

  // now set selected components input control
  let selected_data = common_obj.find_selected_data()
  if (selected_data) {
    params_obj.set_selected_param(selected_data)
  } else {
    $("#input_div, #inc_controls").hide()
  }

  data_handler.draw_fxn_buttons()

  params_obj.set_param_nav_buttons()
}

;(function ($) {
  console.log(`Hey ${device.type}`)
  $("div.navigation-top").remove()
  cmd_buttons = $("button[data-ref]")
  let params = $("#params")

  $("#take_snapshot").on("click", function () {
    // $("#snapshot_text").html(snapshot);
    the_macro.put(snapshot)
  })

  params_obj.on_load()

  $(".slider_input_div").each(function (indx) {
    const item = $(this).attr("item")
    let cmd = $(this).attr("cmd")
    let label = $(this).attr("label")
    let units = "V"
    if (item === "scale" || item === "randomness") {
      units = "%"
    }
    $(this).html(
      `<label for="${item}">${label}</label><input id="${item}" type="number" step="1" min="0" max="100" cmd="${cmd}" />${units}`
    )
    $(this).after(
      `<input id="${item}_slider" cmd="${cmd}" type="range" min="0" max="1023" value="512">`
    )

    $(`#${item}_slider`).on("change", function () {
      const val = $(this).val()
      send_cmd(cmd + val)
    })
    $(`#${item}`).on("change", function () {
      let val = parseFloat($(this).val())
      const item_max = $(this).attr("max")
      dbugger.print(`Item: ${item} val: ${val} item_max: ${item_max}`, false)
      switch (item) {
        case "scale":
          val *= 0.01
          val = val * item_max
          break
        case "offset":
        case "cv_val":
          val += out_offset
          val = val / out_fs
          console.log(val)
          val = val * item_max
      }
      send_cmd(cmd + Math.round(val))
    })
  })

  if (typeof url !== "undefined") refresh_screen()
})(jQuery)
