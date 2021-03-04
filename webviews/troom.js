/*
  init_success   // 初始化RTC成功，返回本地摄制流 { stream }
  init_fail      // 初始化RTC失败
  create_room    // 创建房间完成状态
  join_room      // 加入房间完成状态
  exit_room      // 解散房间完成状态
  quit_room      // 断开链接完成状态
  update_room    // RTC-offer更新完成
  connect_room   // RTC链接成功完成
  stream_room,   // 收到对方摄制流 { stream }
  close_room     // RTC中断更新状态
  error_room     // RTC错误状态
  ==========================================================
  my_stream      // 我方视频推流
  you_stream     // 对方视频推流
  peer           // RTC通道
  code           // 房间标示
  other          // 是否为参与者
  open           // 通信是否已经连接
*/
var Troom = {
  my_stream: null, // 我方视频推流
  you_stream: null, // 对方视频推流
  peer: null, // RTC通道
  code: null, // 房间标示
  other: false, // 是否为参与者
  open: false, // 通信是否已经连接
  on_fun_arr: {}, // 监听实现函数
  /**
   * 支持Http的通信实现
   * name: 请求名称，根据方法有区别
   * data: 向请求发送的必要数据
   * success: 请求成功后执行的方法，需要主动触发
   * @param {name: string, data: object, success: function} obj http-request object
   */
  callFunction: function (obj) {
    console.err('you need a web-http implementation！', obj)
    switch (obj.name) {
      case 'create_room': console.log('create_room', 'To create a communication room, the returned result such as', { code: 'A Code' })
        break
      case 'enter_room': console.log('enter_room', 'To enter a room, request body', obj.data, 'the returned result such as', { code: 'A Code', offer: 'master offer' })
        break
      case 'exit_room': console.log('exit_room', 'exit room and delete data, request body', obj.data)
        break
      case 'update_room': console.log('update_room', 'update offer info, request body', obj.data)
    }
  },
  /**
   * 监听方法执行
   * @param {boolean} status run is true
   */
  showLoading: function (status) {
    console.warn('you need a load implementation！When the status is true, the trigger of other troom methods is prevented', status)
  },
  /**
   * 监听状态刷新
   * @param {boolean} status function done
   * @param {Object} data data
   */
  onStatusfresh: function (status) {
    if (Troom.on_fun_arr[status] != null) {
      Troom.on_fun_arr[status]()
    } else {
      console.warn('you need a status implementation！', status)
    }
  },
  /**
   * 监听部署接口
   */
  on: function (status, fun) {
    Troom.on_fun_arr[status] = fun
  },
  /**
   * 初始化RTC服务
   */
  init: function () {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
    navigator.getUserMedia({ audio: true, video: true }, function (stream) {
      Troom.my_stream = stream
      Troom.onStatusfresh('init_success')
    }, function (error) {
      Troom.onStatusfresh('init_fail')
      console.err('navigator.getUserMedia error: ', error)
    })
  },
  /**
   * 创建房间
   */
  create_room: function () {
    this.showLoading(true)
    this.callFunction({
      name: 'create_room',
      success (res) {
        Troom.showLoading(false)
        Troom.code = res.code
        Troom.peer = Troom.createPeer(true, Troom.my_stream)
        Troom.get_info()
        Troom.onStatusfresh('create_room')
      }
    })
  },
  /**
   * 握手链接
   * @param {*} offer 参与者的offer
   */
  onSignal: function (offer) {
    Troom.peer.signal(offer)
  },
  /**
   * 加入房间
   */
  join_room: function (code) {
    this.showLoading(true)
    this.callFunction({
      name: 'enter_room',
      data: {
        code: code
      },
      success (res) {
        Troom.showLoading(false)
        Troom.code = res.code
        Troom.other = true
        Troom.peer = Troom.createPeer(false, Troom.my_stream)
        Troom.peer.signal(res.offer)
        Troom.onStatusfresh('join_room')
      }
    })
  },
  /**
   * 退出解散房间
   */
  exit_room: function () {
    this.showLoading(true)
    this.callFunction({
      name: 'exit_room',
      data: {
        code: Troom.code
      },
      success () {
        clearInterval(Troom.watch)
        Troom.showLoading(false)
        Troom.code = null
        Troom.other = false
        if (Troom.peer != null) {
          Troom.flag = true
          Troom.quit_room()
        }
        Troom.onStatusfresh('exit_room')
      }
    })
  },
  /**
   * 结束通信
   */
  quit_room: function () {
    Troom.peer.destroy()
    Troom.peer = null
    Troom.you_stream = null
    Troom.onStatusfresh('quit_room')
  },
  get_info: function () {
    Troom.watch = setInterval(function () {
      Troom.callFunction({
        name: 'get_room',
        data: {
          code: Troom.code
        },
        success (res) {
          if (res.offer != null) {
            console.log(res.offer)
            Troom.peer.signal(res.offer)
            clearInterval(Troom.watch)
          }
        }
      })
    }, 3000)
  },
  /**
   * 创建WEB-RTC 通道
   * @param {*} initiator 是否发起者
   * @param {*} stream 视频流
   */
  createPeer (initiator, stream) {
    const peer = new SimplePeer({
      initiator,
      stream,
      config: {
        iceServers: [
          {
            urls: 'stun:stun.l.google.com:19302'
          },
          {
            urls: 'stun:global.stun.twilio.com:3478?transport=udp'
          }
        ]
      }
    })
    peer.on('signal', (e) => {
      if (e.type != null) {
        Troom.callFunction({
          name: 'update_room',
          data: {
            code: Troom.code, // 房间CODE
            offer: JSON.stringify(e), // 通信offer，字符串格式
            other: Troom.other // 是否是参与者
          },
          success () {
            Troom.onStatusfresh('update_room')
          }
        })
      }
    })
    peer.on('connect', (e) => {
      console.log('[peer event]connect')
      Troom.open = true
      Troom.onStatusfresh('connect_room')
    })
    peer.on('stream', (e) => {
      Troom.you_stream = e
      Troom.onStatusfresh('stream_room')
    })
    peer.on('close', () => {
      const other = Troom.other
      const flag = Troom.flag
      Troom.peer.destroy()
      Troom.open = false
      Troom.code = null
      Troom.other = false
      Troom.peer = null
      Troom.flag = null
      Troom.you_stream = null
      Troom.showLoading(false)
      Troom.onStatusfresh('close_room')
      if (other === false && flag !== true) {
        Troom.create_room()
      }
    })
    peer.on('error', (e) => {
      Troom.onStatusfresh('error_room')
    })
    return peer
  }
}
var CloudBase = {
  envId: '',
  status: false,
  init: function (fun) {
    CloudBase.app = tcb.init({ env: CloudBase.envId })
    CloudBase.auth = CloudBase.app.auth({ persistence: 'local' })
    CloudBase.auth.anonymousAuthProvider().signIn().then(function () {
      CloudBase.status = true
      try { fun() } catch (e) { }
    })
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
  callFunction: function (obj) {
    if (CloudBase.status) {
      CloudBase.app.callFunction({
        name: obj.name,
        data: obj.data
      }).then((res) => {
        if (res.result.err === 0) {
          const result = {}
          if (res.result.code != null) {
            result.code = res.result.code
          }
          if (res.result.offer != null) {
            result.offer = JSON.parse(res.result.offer)
          }
          obj.success(result)
        } else {
          CloudBase.showmodel(res.result.msg, 'info')
          Troom.showLoading(false)
        }
      }).catch(e => {
        CloudBase.showmodel('cloudbase function is failed!' + e, 'error')
        Troom.showLoading(false)
      })
    } else {
      CloudBase.showmodel('cloudbase is not init!', 'error')
      Troom.showLoading(false)
    }
  }
}
