const {storePromise} = require('../database')

exports.findById = async (id) => {
  const store = await storePromise

  return store.Image.findOne({where: {id: id}})
}

exports.create = async (contentType, blob, size, fileName) => {
  const store = await storePromise
  return store.Image.create(
    {
      fileName: fileName,
      size: size,
      contentType: contentType,
      blob: blob
    }
  )
}

exports.createImageModel = (user) => ({
  findAllByTicketId: async (ticketId) => {
    const store = await storePromise
    return store.Attachment.findAll({
      include: [
        {model: store.Image, where: {id: ticketId}}
      ]
    })
  }
})