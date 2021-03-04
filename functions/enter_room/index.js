const tcb = require('@cloudbase/node-sdk')

const cloud = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
})
const auth = cloud.auth()
const db = cloud.database()
/*
加入房间
判断房间是否有人，如果无人则将自己的身份ID填充
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

  const arr = (await db.collection('room').where({
    code: parseInt(event.code)
  }).get()).data

  if (arr.length !== 0) {
    if (arr[0].other_id == null) {
      await db.collection('room').where({
        code: parseInt(event.code)
      }).update({
        other_id: uid
      })

      return {
        err: 0,
        code: parseInt(event.code),
        offer: arr[0].user_offer
      }
    } else {
      return {
        err: 1,
        msg: '房间已有他人进入，请稍等'
      }
    }
  } else {
    return {
      err: 1,
      msg: '房间不存在，请确认房间号'
    }
  }
}
