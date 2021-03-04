const tcb = require('@cloudbase/node-sdk')

const cloud = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
})
const auth = cloud.auth()
const db = cloud.database()
/*
销毁房间
直接将此房间号销毁，但房间必须属于自身身份ID才可以
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
  const result = await db.collection('room').where({
    code: code,
    user_id: uid
  }).remove()
  return {
    err: 0,
    msg: result.deleted
  }
}
