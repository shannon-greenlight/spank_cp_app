$ = jQuery

let dbugger = {
  debug_on: false,
  print: function (s, force) {
    if (this.debug_on || force) {
      console.log(s)
    }
  },
}

let the_macro

const out_fs = 128 / 12
const out_offset = out_fs / 2
const zeroPad = (num, places) => String(num).padStart(places, "0")
let cmd_buttons
let legal_values
const cv_offset = 5.4
let data = {}

function display_param(data) {
  // console.log(data);
  const param_num = data.param_num
  let data_value = data.value
  let tail
  const is_selected = data.selected === "true"
  const selected_class = is_selected ? " selected" : ""
  let control = "<div class='param_div" + selected_class + "' >"
  control += " <div class='param param_head'><label>" + data.label + "</label></div>"
  control += " <div class='param param_val " + data.type + selected_class + "'>"
  switch (data.type) {
    case "radio":
      let values = data.values.split(",")
      let input_name = `p${param_num}`
      for (let i = 0; i < values.length; i++) {
        control += " <div class='param'>"
        control += "<input name='" + input_name + "'"
        control += ` class="cmd_button" title="${i}" data-ref="${i}" `
        control += ' type="radio"'
        // this prevents radio button from jumping around
        if (data.cmd === "p") {
          if ($(`input[name=${input_name}][value=${i}]:checked`).length) control += " checked "
        } else {
          if (data.value === values[i]) control += " checked "
        }
        control += ' value="' + i + '" />'
        control += "<label for='" + values[i] + "' >" + values[i] + "</label>"
        control += "</div>" // closes .param
      }
      control += "<div class='clear' /></div>" // closes .param_val
      break
    case "sequence":
      dbugger.print(data)
      dbugger.print(`Data val: ${data_value}`, false)
      if (data.dig_num > data_value.length - 1) data_value += " "
      let dval = data_value
      tail = dval.slice(parseInt(data.dig_num) + 1)
      let hilight = param_num == "1" ? "hilight_emphasize" : "hilight"
      //control += " <div class='"+data.type+"'>";
      control += "<input"
      control += ' name="s"'
      control += ' type="hidden"'
      control += ' value="' + data_value + '" />'
      control += "<div>"
      control += dval.slice(0, data.dig_num)
      control += `<span class="${hilight}">${dval.substr(data.dig_num, 1)}</span>${tail}</div>`
      control += "</div>"
      break
    default:
      control += "<input name='p" + param_num + "'"
      control += ' type="hidden"'
      control += ' min="' + data.min + '"'
      control += ' max="' + data.max + '"'
      control += ' component="' + data.type + '"'
      // if (data.selected==="false") control += " disabled";
      control += ' value="' + data.value + '" />'

      control += "<div class='param_body'>"
      let n = data_value
      let plussign = data.dp > 0 || data.min < 0 ? "+" : " "
      plussign = data.value < 0 ? "-" : plussign
      if (data.type === "number") {
        if (data.dp === "0") {
          n = zeroPad(Math.abs(data_value), data.num_digits)
        } else {
          dbugger.print(`Data Value: ${data_value}`, false)
          dbugger.print(`dig_num: ${data.dig_num}`, false)
          // n = data_value<0 ? "-" : "+"
          let divisor = Math.pow(10, data.dp)
          let int_part = Math.floor(Math.abs(data_value) / divisor)
          if (data.max >= 10000) {
            int_part = zeroPad(int_part, 2)
            if (data.dig_num > 0) data.dig_num--
            dbugger.print(`dig_num2: ${data.dig_num}`, false)
          }
          let frac_part = zeroPad(Math.abs(data_value) % divisor, data.dp)
          n = int_part.toString()
          n += "."
          n += frac_part
          dbugger.print(`n: ${n}`, false)
        }
      } else {
        plussign = ""
      }
      dbugger.print(`n: ${n}`, false)
      if (data.selected === "true" && (data.type === "number" || data.type === "text")) {
        tail = n.slice(parseInt(data.dig_num) + 1)
        control += plussign
        control += n.slice(0, data.dig_num)
        control +=
          "<span class='hilight'>" +
          n.substr(data.dig_num, 1) +
          "</span>" +
          tail +
          "</div><!-- end param_body -->"
      } else {
        control += plussign + n + "</div><!-- end param_body -->"
      }

      control += "</div>"
  }
  control += " <div class='clear' /> <!-- clear param -->"
  control += "</div></div>" // closes #param_div
  return control
}

function display_input(data) {
  dbugger.print(data)
  let data_value = data.value
  let control = ""
  let values
  switch (data.type) {
    case "select": // really select, needs change to arduino code first
      values = data.values.split(",")
      if (values.length > 1) {
        control += "<select id='param_input' name='p" + data.param_num + "'>"
        //control += " <div class='param  param_val "+data.type+"'>";
        for (let i = 0; i < values.length; i++) {
          control += "<option "
          if (data.value === values[i]) control += " selected "
          control += ' value="' + i + '">' + values[i] + "</option>"
        }
        control += "</select>"
      }
      break
    case "sequence":
      data_value = data.value
      control += "<input"
      control += ' id="param_input"'
      control += ' type="text"'
      control += ' pattern="[' + data.legal_values + ']"'
      control += ' class="sequence"'
      control += ' value="' + data.value + '" />'
      break
    case "number":
      control += "<input name='p" + data.param_num + "'"
      control += ' id="param_input"'
      control += ' type="number"'
      control += ' min="' + data.min + '"'
      control += ' max="' + data.max + '"'
      control += ' value="' + data.value + '" />'
      break
    case "text":
      control += "<input name='p" + data.param_num + "'"
      control += ' id="param_input"'
      control += ' type="text"'
      control += ' class="text_input"'
      control += ' value="' + data.value + '" />'
      break
  }
  return control
}

function fxn_button(data, i) {
  let fxn = data.fxns[i]
  let selected = data.fxn === fxn ? "selected " : ""
  //console.log(fxn,i,selected);
  let out = `<button id="fxn_button_${i}" title="f${i}" class="${selected}cmd_button" data-ref="f${i}">${fxn}</button>`
  return out
}

function widget(data) {
  $ = jQuery
  const bonk_title = `Hi! I'm ${data.device_name}, your Bonkulator and this is my Control Panel.
 You can do lots of things through this interface that you can't do from the front panel.
 And you don't have to wade through patch cords to get to the controls.`
  $("#head_div img").attr("title", bonk_title)
  let title = $("#head_div img").attr("title").toString()
  title = title.replace("Spanky", data.device_name)
  dbugger.print(title, false)
  $("#head_div img").attr("title", title)
  $("#device_name").html(`"${data.device_name.trim()}"`)
  // $("#spank_fxn").html("<span class='fxn_head'> "+data.fxn+"</span>");
  $("#param_label").html(data.fxn + " Parameters")
  $("#input_div .param_div").append('<div id="param_value" class="param"></div>')

  $("#repeat_on").css("background-color", data.repeat_on === "ON" ? "#fbd310" : "#aaa")
  $("#trigger_on").css("background-color", data.triggered === "ON" ? "Red" : "#aaa")
  $("#trigger_button").css("background-color", data.gate === "ON" ? "Green" : "#aaa")
  $("#tog_button").css("background-color", data.toggle === "ON" ? "Blue" : "#aaa")
  $("#ext_trig_button")
    .html(data.ext_trigger_disable)
    .css("background-color", data.ext_trigger_disable === "enabled" ? "Green" : "#aaa")
  $("#clk_button")
    .html(data.clock)
    .css("background-color", data.clock === "internal" ? "Green" : "orange")
  $("#analog_label").html(data.quantized)
  let controls = ""
  if (data.fxn === "User") {
    data.sequence.param_num = data.param_num
    controls += display_param(data.sequence)
    legal_values = data.sequence.legal_values
  }
  if (data.message && data.fxn !== "User") {
    if (data.fxn === "LFO") {
      waveform_data = data.message.split(", ")
      setTimeout(function () {
        waveform_obj.draw_waveform()
        the_canvas.show()
      }, canvas_delay)
      meas_div.show()
    } else {
      meas_div.html(data.message).show()
    }
  } else {
    meas_div.hide()
  }
  if (data.fxn === "Bounce") {
    meas_div.css({ "text-align": "right", height: "initial" })
  } else {
    meas_div.css({ "text-align": "center" })
  }
  switch (data.fxn) {
    case "WiFi":
      //case "Settings":
      $("#adj_controls, #trigger_controls").hide()
      break
    default:
      $("#adj_controls, #trigger_controls").show()
  }

  let param_set = 0 // only one param set
  if (data.params[param_set]) {
    for (let i = 0; i < data.params[param_set].length; i++) {
      data.params[param_set][i].dig_num = data.digit_num
      data.params[param_set][i].cmd = data.cmd
      controls += display_param(data.params[param_set][i])
    }
  }
  // controls += display_param({ label: "<span class='hide'>a</span>", type: "param_buttons"})
  $("#params").html(controls)

  $(".slider_input_div").each(function (indx) {
    const item = $(this).attr("item")
    const item_max = data[$(this).attr("max")]
    const item_val = data[item]
    const items = $(`#${item},#${item}_slider`)
    const item_input = $(`#${item}`)
    const item_slider = $(`#${item}_slider`)
    if (data[item] === "disabled") {
      items.prop("disabled", true)
    } else {
      items.prop("disabled", false).attr("max", item_max)
      item_slider.val(item_val)
      switch (item) {
        case "scale":
          item_input.val(Math.round((100 * item_val) / item_max))
          break
        case "offset":
        case "cv_val":
          item_input.val(((out_fs * item_val) / item_max - out_offset).toFixed(2))
          break
      }
    }
  })

  //$("#cv_val, #cv_val_slider").prop("disabled", data.fxn==="LFO");

  // now set selected components input control
  let selected_data
  if (data.fxn === "User" && data.param_num === "0") {
    selected_data = data.sequence
    dbugger.print("User sequence is selected. Data: " + selected_data)
  } else {
    let is_selected = (param) => {
      return param.selected === "true"
    }
    selected_data = data.params[0].find(is_selected)
  }
  if (selected_data) {
    // dbugger.print("Selected: ", selected_data)
    //let selected_data=data.params[0][data.param_num];
    //let selected_param= $($("#params .param_div input[component]")[data.param_num]);
    let selected_param = $("#params .param_div .selected input")
    // console.log("Selected param: ",selected_param);
    // let the_input = selected_param.find("input");
    if (
      !(
        selected_data.type === "radio" ||
        (selected_data.type === "select" && selected_data.values.split(",").length === 1)
      )
    ) {
      // console.log("Component: " +the_input.attr("component"));
      // console.log("Component: " +selected_data.type);
      //display_input(selected_data);
      $("#param_head").html(`<strong>Enter ${selected_data.label}</strong>`)
      $("#param_value").html(display_input(selected_data))
      let a = $("#param_value").detach()
      console.log(a)
      $("div.selected.param").append(a)
      switch (selected_param.attr("component")) {
        case "select":
          $("#param_value").css("top", 0)
          break
        default:
          dbugger.print(`Component: ${selected_param.attr("component")}`, false)
      }
      // $("#param_input").val(selected_param.find("input").val());
      $("#inc_controls").show()
    } else {
      // $("#input_div").hide();
    }
  } else {
    $("#input_div, #inc_controls").hide()
  }
  //console.log(data.fxns);

  if (data.fxns) {
    let fxns = ""
    for (let i = 0; i < data.fxns.length; i++) {
      fxns += fxn_button(data, i)
    }
    $("#fxn_buttons").html(fxns)
    //console.log(fxns);
    cmd_buttons = $("button[data-ref]")
  }
  $("#control_div button[data-ref]").prop("disabled", false)
  const num_params = $("#params .param_div").length
  dbugger.print(`Num params: ${num_params}`, false)
  $("#param_buttons button").prop("disabled", num_params < 2)
  const selected_type = $("#param_input").attr("type")
  $("#lr_buttons button, #inc_controls button").prop(
    "disabled",
    (selected_type !== "number" && selected_type !== "text") || $("#param_input").is(":hidden")
  )
}

;(function ($) {
  console.log("Hey Spankulator!")
  $("div.navigation-top").remove()
  let snapshot = ""
  cmd_buttons = $("button[data-ref]")
  let params = $("#params")

  $("#take_snapshot").on("click", function () {
    // $("#snapshot_text").html(snapshot);
    the_macro.put(snapshot)
  })

  $("#control_div").on("click", "button[data-ref]", function () {
    let cmd = $(this).attr("data-ref")
    $(this).prop("disabled", true)
    send_cmd(cmd)
  })

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
      dbugger.print(`val: ${val} item_max: ${item_max}`, true)
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

  params.on("change", "input", function () {
    dbugger.print("Input changed: " + $(this).val(), false)
    switch ($(this).attr("type")) {
      case "radio":
      case "checkbox":
        send_cmd($(this).attr("name"))
        break
      default:
    }
    let cmd = $(this).val()
    send_cmd(cmd)
  })

  params.on("click", ".param_val", function () {
    const selected = $(this).hasClass("selected")
    let my = $(this).find("input")
    let my_name = my.attr("name")
    let my_type = my.attr("type")
    dbugger.print("input clicked: " + my_name + " " + my_type, false)
    if (!selected) {
      send_cmd(my_name)
    } else {
      $("#param_value").css("top", 0)
      if (my_type === "number") {
      }
    }
  })

  let param_changing = false
  const param_value = $("#params, #adj_div")
  param_value.on("change focusin", "#param_input, input", function () {
    dbugger.print("Changin!", false)
    clearTimeout(timeout)
    param_changing = true
  })

  param_value
    .on("change", "#param_input", function () {
      dbugger.print("Changin!", false)
      if ($(this).attr("type") === "text") {
        send_cmd("$" + $(this).val())
      } else {
        send_cmd($(this).val())
      }
      param_changing = false
    })
    .on("keypress", "input.sequence", function (e) {
      // !!! Don't print anything to console in this fxn. Crashes Chrome when entering value
      // const regexp = new RegExp(`[UDTBCS\\r\\n]`);
      const regexp = new RegExp(`[${legal_values}\\r\\n]`)
      var txt = String.fromCharCode(e.which)
      if (!txt.match(regexp)) {
        return false
      }
    })
    .on("keypress", "input.text_input", function (e) {
      // !!! Don't print anything to console in this fxn. Crashes Chrome when entering value
      const regexp = new RegExp(`[^%#]+`)
      var txt = String.fromCharCode(e.which)
      if (!txt.match(regexp)) {
        return false
      }
    })

  async function send_one_cmd(cmd) {
    await send_cmd(cmd)
  }

  // macros
  the_macro = {
    state: "IDLE",
    recorded_macro: [],
    macro_elem: $("#macro"),
    record_button: $("#rec_macro"),
    clr_button: $("#clr_macro"),
    exe_button: $("#exe_macro"),
    snapshot_button: $("#take_snapshot"),
    is_recording: function () {
      return this.state === "REC"
    },
    macro_exists: function () {
      return Array.isArray(this.recorded_macro) && this.recorded_macro.length > 0
    },
    set_buttons: function () {
      this.exe_button.prop("disabled", !this.macro_exists())
    },
    set_text: function () {
      this.macro_elem.val(JSON.stringify(this.recorded_macro))
    },
    put: function (val) {
      try {
        this.recorded_macro = JSON.parse(val)
        this.set_text()
      } catch (e) {
        dbugger.print("Didn't parse")
      }
      this.set_buttons()
    },
    clr: function () {
      dbugger.print("Clr Macro", false)
      this.put("[]")
    },
    append: function (val) {
      this.recorded_macro.push(val)
      this.set_text()
    },
    put_state: function (state) {
      this.state = state
      this.set_buttons()
      let background_color = ""
      switch (this.state) {
        case "IDLE":
          background_color = ""
          $("#macro_buttons .indicator").html("&nbsp;").css("background-color", background_color)
          this.record_button
            .html("Record")
            .attr("title", "Click to Start Recording")
            .css("background-color", "#444444")
            .prop("disabled", false)
          this.exe_button.prop("disabled", false)
          this.snapshot_button.prop("disabled", false)
          break
        case "REC":
          background_color = "#f00"
          $("#rec_state").html(this.state).css("background-color", background_color)
          this.exe_button.prop("disabled", true)
          this.record_button
            .html("Stop")
            .attr("title", "Click to Stop Recording")
            .prop("disabled", false)
          // .css("background-color", "#888")
          this.snapshot_button.prop("disabled", true)
          break
        case "EXEC":
          background_color = "#080"
          $("#play_state").html(this.state).css("background-color", background_color)
          this.record_button.prop("disabled", true).css("background-color", "#888")
          this.exe_button.prop("disabled", true)
          this.snapshot_button.prop("disabled", true)
          break
      }
    },
    set: function () {
      this.put_state("REC")
    },
    reset: function () {
      this.put_state("IDLE")
    },
    toggle: function () {
      this.put_state(this.is_recording() ? "IDLE" : "REC")
    },
    execute: function () {
      this.put_state("EXEC")
      this.clr_button.prop("disabled", true)
      this.exe_button.prop("disabled", true)
      let macro = this.macro_elem.val()
      console.log("Macro: " + macro)
      let op = ""

      //let parts = macro.split("\n");
      let parts = this.recorded_macro
      let i
      console.log("Parts", parts)
      for (let i = 0; i < parts.length; i++) {
        send_cmd(parts[i])
      }
      send_cmd("e")
    },
    end: function () {
      //console.log("Ending macro");
      $("#exe_macro, #clr_macro").prop("disabled", false)
      this.reset()
    },
    init: function () {
      let self = this
      this.reset()
      this.clr()
      this.clr_button.on("click", function () {
        self.clr()
      })

      $("#rec_macro").on("click", function () {
        self.toggle()
      })

      this.exe_button.on("click", function (e) {
        e.preventDefault()
        self.execute()
      })

      $("#macro").on("keyup", function () {
        self.put($(this).val())
        self.set_buttons()
      })
    },
  }
  the_macro.init()
  the_macro.set_buttons()

  function take_snapshot(data) {
    // todo capture all user data
    // console.log(data);
    let retval = 0
    let item = ""
    let out = []

    // if(data.fxns) {
    //     const fxn = data.fxns.indexOf(data.fxn);
    //     let item=`f${fxn}`;
    //     out.push(item);
    // }

    item = `f${data.fxn_num}`
    out.push(item)

    item = `c${data.cv_val}`
    out.push(item)

    if (data.scale !== "disabled") {
      item = `S${data.scale}`
      out.push(item)
    }

    if (data.offset !== "disabled") {
      item = `O${data.offset}`
      out.push(item)
    }

    let val = data.clock === "internal" ? 0 : 1
    item = `K${val}`
    out.push(item)

    val = data.trigger_enable === "enabled" ? 1 : 0
    item = `D${val}`
    out.push(item)

    val = data.ext_trigger_disable === "enabled" ? 0 : 1
    item = `E${val}`
    out.push(item)

    val = data.repeat_on === "ON" ? 1 : 0
    item = `r${val}`
    out.push(item)

    val = data.gate === "ON" ? 1 : 0
    item = `G${val}`
    out.push(item)

    val = data.toggle === "ON" ? 1 : 0
    item = `T${val}`
    out.push(item)

    if (data.sequence) {
      out.push(data.sequence.value)
      out.push("s") // select sequence
      out.push("#0") // select 1st digit
      data.sequence.params.forEach(function (item, idx) {
        if (idx > 0) {
          out.push("s") // select sequence
          out.push("[C") // next digit
        }
        item.forEach(function (val, indx) {
          out.push(`p${indx}`)
          out.push(val.numeric_val)
        })
      })
    } else {
      data.params[0].forEach(function (val, indx) {
        out.push(`p${indx}`)
        out.push(val.numeric_val)
      })
    }

    return JSON.stringify(out)
  }

  receive_data = function (text) {
    dbugger.print(text, false)
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.log(e)
      console.log(text)
    }
    // data = text
    data.in_user_waveforms = function () {
      return this.fxn_num === "8" && this.fxn.indexOf("User") === 0
    }

    console.log("Receiving:", data)
    snapshot = take_snapshot(data)
    // console.log(snapshot);

    if (data.cmd === "e") {
      the_macro.end()
    } else {
      //if(cmd.substr(0,1)!=="p" && data.fxn) widget(data);
      if (data.fxn && !param_changing) widget(data)
      param_changing = false
    }
    the_queue.busy = false
  }

  async function _send_cmd(cmd) {
    const res = prep_request(cmd)
    if (res.fail) return
    cmd = res.cmd
    the_queue.busy = true

    try {
      request_data(cmd)
    } catch (e) {
      console.log(e)
      data.err = e
    }
  }

  $("#refresh_button").on("click", function () {
    // $("#control_div").fadeOut(50);
    refresh_screen()
  })

  // heartbeat manages the_queue
  let timeout
  setInterval(function () {
    param_changing = false
    if (the_queue.data_available()) {
      clearTimeout(timeout)
      _send_cmd(the_queue.dequeue())
    } else {
      if (data.triggered === "ON" && data.fxn === "Bounce") {
        data.triggered = "OFF"
        timeout = setTimeout(refresh_screen, 1000)
      }

      // if ((data.repeat_on === "OFF" || (data.fxn==="Bounce" && data.repeat_on === "ON")) && data.triggered === "ON") {
      //     refresh_screen();
      // }
    }
  }, 250)
  if (typeof url !== "undefined") refresh_screen()
})(jQuery)
