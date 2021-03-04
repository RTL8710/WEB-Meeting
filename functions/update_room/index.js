const tcb = require('@cloudbase/node-sdk')

const cloud = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
})
const auth = cloud.auth()
const db = cloud.database()
/*
更新信息
当主人或者参与者RTC创建后，将信令更新到数据库
{
    _id:系统数据库id,
    code:房间号,
    type:忙碌状态（false空闲，true占用）
    due:最近活跃时间（客户端应每10分钟上报状态）
    user_id:房间使用者用户id
    other_id:加入房间的用户id
    user_offer:房间主人RTC
    other_offer:加入者RTC
}
*/

exports.main = async (event) => {
  const { uid } = auth.getUserInfo()
  const query = {
    code: parseInt(event.code)
  }
  const data = {
    due: db.serverDate()
  }

  if (event.other) {
    data.other_id = uid
    if (event.offer != null) {
      data.other_offer = event.offer
    }
  } else {
    data.user_id = uid
    if (event.offer != null) {
      data.user_offer = event.offer
    }
  }

  await db.collection('room').where(query).update(data)
  return {
    err: 0,
    msg: ''
  }
}
