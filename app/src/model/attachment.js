const {storePromise} = require('../database')

exports.findById = async (id) => {
  const store = await storePromise

  return store.Attachment.findOne({where: {id: id}})
}

exports.create = async (contentType, blob, size, fileName) => {
  const store = await storePromise
  return store.Attachment.create(
    {
      fileName: fileName,
      size: size,
      contentType: contentType,
      blob: blob
    }
  )
}

exports.createAttachmentModel = (user) => ({
  findAllByTicketId: async (ticketId) => {
    const store = await storePromise
    return store.Attachment.findAll({
      include: [
        {model: store.Ticket, where: {id: ticketId}}
      ]
    })
  }
})