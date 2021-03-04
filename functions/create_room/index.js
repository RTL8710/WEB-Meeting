const tcb = require('@cloudbase/node-sdk')

const cloud = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
})
const auth = cloud.auth()
const db = cloud.database()
const _ = db.command
/*
创建房间，
如果自身原本有房间，则使用自己的房间；
如果没有房间，则查看空闲15分钟的房间（此需要客户端15分钟内调用update_room云函数来保持不被占用-未实现）
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
const initRoom = async function (id, uid) {
  await db.collection('room').doc(id).update({
    type: true,
    openid: uid,
    due: db.serverDate(),
    user_id: uid,
    user_offer: null,
    other_id: null,
    other_offer: null
  })
}

exports.main = async () => {
  const { uid } = auth.getUserInfo()

  const myArr = (await db.collection('room').where({
    user_id: uid
  }).get()).data

  if (myArr.length === 0) {
    const cloudArr = (await db.collection('room').where(_.or([
      {
        type: false
      },
      {
        due: _.lt(db.serverDate({
          offset: -15 * 60 * 1000
        }))
      }
    ])).get()).data
    if (cloudArr.length === 0) {
      let roomCode = null
      do {
        roomCode = Math.round(900000 * Math.random() + 100000)
      } while ((await db.collection('room').where({ code: roomCode }).count()).total !== 0)
      await db.collection('room').add({
        code: roomCode,
        type: true,
        due: db.serverDate(),
        user_id: uid,
        user_offer: null,
        other_id: null,
        other_offer: null
      })
      return {
        err: 0,
        code: roomCode
      }
    } else {
      initRoom(cloudArr[0]._id, uid)
      return {
        err: 0,
        code: cloudArr[0].code
      }
    }
  } else {
    initRoom(myArr[0]._id, uid)
    return {
      err: 0,
      code: myArr[0].code
    }
  }
}
