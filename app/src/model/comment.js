const {Op} = require('sequelize')

const {storePromise} = require('../database')
const {checkTicketReadPrivileges, checkTicketCreateOrUpdatePrivileges, checkTicketDeletePrivileges} = require('./ticket')

exports.createCommentModel = (user) => ({
  findById: async (id) => {
    const ticket = await findById(id)
    checkTicketReadPrivileges(user, ticket)
    return ticket
  },
  findByFilter: async ({createdAt, ticketAssigneeId, ticketAuthorId}) => {
    const sqlFilter = {}
    if (createdAt) {
      sqlFilter.createdAt = {[Op.between]: [createdAt.from, createdAt.to]}
    }

    const ticketTableName = store.Ticket.tableName

    if (ticketAssigneeId) {
      sqlFilter[`${ticketTableName}.assigneeId`] = ticketAssigneeId
    }

    if (ticketAuthorId) {
      sqlFilter[`${ticketTableName}.authorId`] = ticketAuthorId
    }

    const store = await storePromise
    const tickets = store.Comment.findAll(
      {
        where: sqlFilter,
        include: [
          {model: store.Ticket, as: ticketTableName}
        ]
      }
    )
    tickets.forEach(ticket => checkTicketReadPrivileges(ticket))
    return tickets
  },
  createOrUpdateById: async ({id, ...ticketCommentInput}) => {
    const store = await storePromise

    let comment
    if (id) {
      if (!await findById(id)) {
        return null
      }

      await store.Comment.update(ticketCommentInput, {
          where: {id: id}
        }
      )
      comment = await findById(id)
    } else {
      comment = await store.Ticket.create(ticketCommentInput)
    }

    checkTicketCreateOrUpdatePrivileges(user, comment)
    return comment
  },
  deleteById: async (id) => {
    const comment = await findById(id)
    checkTicketDeletePrivileges(user, comment)
    await comment.destroy()

    return null
  },
  findAllByTicketId: async (ticketId) => {
    const store = await storePromise
    return store.Comment.findAll({
      include: [
        {model: store.Ticket, where: {id: ticketId}}
      ]
    })
  }

})

async function findById(id) {
  const store = await storePromise
  return store.Comment.findOne({where: {id: id}})
}
