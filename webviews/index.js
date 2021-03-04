var Room = {
  option: true,
  init: function (troom) {
    Room.troom = troom
    Room.video_you = document.getElementById('you')
    Room.video_me = document.getElementById('me')
    Room.novedio = document.getElementById('novedio')
    Room.number = document.getElementById('number')
    Room.create_btn = document.getElementById('create')
    Room.join_btn = document.getElementById('join')
    Room.close_btn = document.getElementById('close')
    Room.quit_btn = document.getElementById('quit')

    Room.troom.on('init_success', function () {
      document.getElementById('video_model').style = ''
      document.getElementById('tool_model').style = ''
      Room.novedio.style = 'display: none;'
      Room.show_you(Room.troom.my_stream)
    })
    Room.troom.on('init_fail', function () {
      Room.novedio.innerText = '本应用需要浏览器支持摄像头麦克风，请重新设置'
    })
    Room.troom.on('create_room', function () {
      Room.number.value = Room.troom.code
      Room.number.setAttribute('disabled', 'true')
      Room.create_btn.style = 'display:none;'
      Room.close_btn.style = ''
      Room.join_btn.style = 'visibility: hidden;'
    })
    Room.troom.on('join_room', function () {
      Room.number.value = Room.troom.code
      Room.number.setAttribute('disabled', 'true')
      Room.create_btn.style = 'visibility: hidden;'
      Room.quit_btn.style = ''
      Room.join_btn.style = 'display:none;'
    })
    Room.troom.on('exit_room', function () {
      Room.number.value = ''
      Room.number.removeAttribute('disabled')
      Room.create_btn.style = ''
      Room.close_btn.style = 'display:none;'
      Room.join_btn.style = ''
    })
    Room.troom.on('quit_room', function () {

    })
    Room.troom.on('close_room', function () {
      Room.show_you(Room.troom.my_stream, false)
      Room.video_me.load()
      Room.number.value = null
      Room.option = true
      Room.create_btn.style = ''
      Room.close_btn.style = 'display:none;'
      Room.join_btn.style = ''
      Room.quit_btn.style = 'display:none;'
    })
    Room.troom.on('update_room', function () {
      console.log('加入成功！')
    })
    Room.troom.on('connect_room', function () {
      if (!Room.troom.other) {
        Room.create_btn.style = 'visibility: hidden;'
        Room.close_btn.style = 'display:none;'
        Room.quit_btn.style = ''
        Room.join_btn.style = 'display:none;'
      }
    })
    Room.troom.on('stream_room', function () {
      Room.show_you(Room.troom.you_stream, true)
      Room.show_me(Room.troom.my_stream, false)
    })
    Room.troom.showLoading = function (status) {
      if (status) {
        Room.create_btn.setAttribute('disabled', 'true')
        Room.close_btn.setAttribute('disabled', 'true')
        Room.join_btn.setAttribute('disabled', 'true')
        Room.number.setAttribute('disabled', 'true')
        Room.quit_btn.setAttribute('disabled', 'true')
        Room.create_btn.innerText = '执行中'
        Room.close_btn.innerText = '执行中'
        Room.join_btn.innerText = '执行中'
        Room.quit_btn.innerText = '执行中'
      } else {
        Room.create_btn.removeAttribute('disabled')
        Room.close_btn.removeAttribute('disabled')
        Room.join_btn.removeAttribute('disabled')
        Room.number.removeAttribute('disabled')
        Room.quit_btn.removeAttribute('disabled')
        Room.create_btn.innerText = '创建房间'
        Room.close_btn.innerText = '结束房间'
        Room.join_btn.innerText = '加入房间'
        Room.quit_btn.innerText = '断开通信'
      }
    }
  },
  changeview: function () {
    console.log(Room.troom.open, Room.option)
    if (Room.troom.open === true) {
      if (Room.option) {
        Room.show_me(Room.troom.you_stream, true)
        Room.show_you(Room.troom.my_stream, false)
        Room.option = false
      } else {
        Room.show_me(Room.troom.my_stream, false)
        Room.show_you(Room.troom.you_stream, true)
        Room.option = true
      }
    }
  },
  create_bind: function () {
    Room.troom.create_room()
  },
  join_bind: function () {
    const tempCode = Room.number.value
    if (tempCode !== '') {
      Room.troom.join_room(tempCode)
    } else {
      Room.showmodel('需要填写房间号!', 'info')
    }
  },
  exit_bind: function () {
    Room.troom.exit_room()
  },
  quit_bind: function () {
    Room.troom.quit_room()
  },
  showmodel: function (text, type) {
    if (type === 'error') {
      console.error(text)
    } else if (type === 'warn') {
      console.warn(text)
    } else {
      console.log(text)
    }
  },
  show_you: function (stream, mute) {
    Room.video_you.load()
    if (window.URL) {
      Room.video_you.srcObject = stream
    } else {
      Room.video_you.src = stream
    }
    Room.video_you.muted = !mute
    Room.video_you.play()
  },
  show_me: function (stream, mute) {
    Room.video_me.load()
    if (window.URL) {
      Room.video_me.srcObject = stream
    } else {
      Room.video_me.src = stream
    }
    Room.video_me.muted = !mute
    Room.video_me.play()
  }
}
