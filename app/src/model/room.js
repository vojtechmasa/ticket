const {storePromise} = require('../database')

exports.createOrUpdateByIds = async (ticketRoomInputs) => {
  ticketRoomInputs.map(ticketRoomInput => createOrUpdateById(ticketRoomInput))
}

async function createOrUpdateById({id, ...ticketRoomInput}) {
  const store = await storePromise

  let room
  if (id) {
    if (!await findById(id)) {
      room = await store.Room.create({id, ...ticketRoomInput})
    } else {
      await store.Room.update(ticketRoomInput, {
          where: {id: id}
        }
      )
      room = await findById(id)
    }
  } else {
    room = await store.Room.create(ticketRoomInput)
  }
  return room
}

async function findById(id) {
  const store = await storePromise
  return store.Room.findOne({where: {id: id}})
}
