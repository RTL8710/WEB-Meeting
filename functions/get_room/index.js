const tcb = require('@cloudbase/node-sdk')

const cloud = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
})
const auth = cloud.auth()
const db = cloud.database()
/*
获取房间信息
获取房间中其他人的信令，在客户端采用每3秒钟轮询调用此函数实现
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
  const code = parseInt(event.code)
  const result = (await db.collection('room').where({
    code: code,
    user_id: uid
  }).field({
    other_offer: true
  }).get()).data
  if (result.length !== 0) {
    return {
      err: 0,
      offer: result[0].other_offer
    }
  } else {
    return {
      err: 1,
      msg: ''
    }
  }
}
