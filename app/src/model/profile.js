const {storePromise} = require('../database')

exports.createOrUpdateByIds = async (ticketProfileInputs) => {
  ticketProfileInputs.map(ticketProfileInput => createOrUpdateById(ticketProfileInput))
}

exports.createProfileModel = (user) => ({
  findById: async (id) => {
    const profile = await findById(id)
    //TODO check privileges
    return profile
  },
  findWatchersByTicketId: async (ticketId) => {
    const store = await storePromise
    return store.Profile.findAll({
      include: [{model: store.Ticket, as: 'tickets', where: {id: ticketId}}]
    })
  }
})

async function createOrUpdateById({id, ...ticketProfileInput}) {
  const store = await storePromise

  let profile
  if (id) {
    if (!await findById(id)) {
      profile = await store.Profile.create({id, ...ticketProfileInput})
    } else {
      await store.Profile.update(ticketProfileInput, {
          where: {id: id}
        }
      )
      profile = await findById(id)
    }
  } else {
    profile = await store.Profile.create(ticketProfileInput)
  }
  return profile
}

async function findById(id) {
  const store = await storePromise
  return store.Profile.findOne({where: {id: id}})
}
