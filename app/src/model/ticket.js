const {Op} = require('sequelize')

const {storePromise} = require('../database')
const {allPrivileges} = require('../auth')

const orderDirectionMapping = {
  DESCENDING: 'DESC',
  ASCENDING: 'ASC'
}

exports.checkTicketReadPrivileges = checkTicketReadPrivileges
exports.checkTicketCreateOrUpdatePrivileges = checkTicketCreateOrUpdatePrivileges
exports.checkTicketDeletePrivileges = checkTicketDeletePrivileges

exports.createTicketModel = (user) => ({
  findById: async (id) => {
    const ticket = await findById(id)
    checkTicketReadPrivileges(user, ticket)
    return ticket
  },
  findByFilter: async (filter, pageSpec) => {
    const {state, ticketType, createdAt, updatedAt, resolvedAt, reassignedAt, ...sqlFilter} = filter
    if (state) {
      sqlFilter.state = {[Op.in]: state}
    }
    if (ticketType) {
      sqlFilter.ticketType = {[Op.in]: ticketType}
    }

    //TODO convert date to datetime somehow and deal with the last day
    if (createdAt) {
      console.log(`createdAt: ${JSON.stringify(createdAt)}`)
      sqlFilter.createdAt = {[Op.between]: [createdAt.from, createdAt.to]}
    }
    if (updatedAt) {
      console.log(`updatedAt: ${JSON.stringify(updatedAt)}`)
      sqlFilter.updatedAt = {[Op.between]: [updatedAt.from, updatedAt.to]}
    }
    if (resolvedAt) {
      console.log(`resolvedAt: ${JSON.stringify(resolvedAt)}`)
      sqlFilter.resolvedAt = {[Op.between]: [resolvedAt.from, resolvedAt.to]}
    }
    if (reassignedAt) {
      console.log(`reassignedAt: ${JSON.stringify(reassignedAt) }`)
      sqlFilter.reassignedAt = {[Op.between]: [reassignedAt.from, reassignedAt.to]}
    }

    const store = await storePromise

    const orders = pageSpec.order.map(order =>
      order.by.split('.').concat([orderDirectionMapping[order.direction]])
    )

    console.log(`!!!!!!!!!!!1 orders: ${JSON.stringify(orders)}`)

    const {count, rows} = await store.Ticket.findAndCountAll(
      {
        where: sqlFilter,
        offset: pageSpec.first,
        limit: pageSpec.count,
        order: orders,
        include: [
          {
            model: store.Profile,
            as: 'author'
          }
        ]
      }
    )
    const totalCount = await store.Ticket.count()

    rows.forEach(ticket => checkTicketReadPrivileges(user, ticket))
    return {
      first: pageSpec.first,
      count: count,
      totalCount: totalCount,
      items: rows
    }
  },
  createOrUpdateById: async ({id, watcherIds, attachmentIds, imageIds, commentIds, ...ticketInput}) => {
    const store = await storePromise

    if (id) {
      if (!await findById(id)) {
        return null
      }

      await store.Ticket.update(ticketInput, {
          where: {id: id}
        }
      )
    } else {
      id = (await store.Ticket.create(ticketInput)).id
    }

    const ticket = await findById(id)

    if (watcherIds) {
      console.log(`Watchers: ${JSON.stringify(watcherIds)}`)
      const watchers = await store.Profile.findAll({where: {id: {[Op.in]: watcherIds}}})
      watchers.forEach(w => w.addTicket(id))
      ticket.setWatchers(watchers)
    }
    if (attachmentIds) {
      console.log(`Attachments: ${JSON.stringify(attachmentIds)}`)
      const attachments = await store.Attachment.findAll({where: {id: {[Op.in]: attachmentIds}}})
      attachments.forEach(a => a.setTicket(id))
      ticket.setAttachments(attachmentIds)
    }
    if (imageIds) {
      console.log(`Images: ${JSON.stringify(imageIds)}`)
      const images = await store.Image.findAll({where: {id: {[Op.in]: imageIds}}})
      images.forEach(a => a.setTicket(id))
      ticket.setImages(imageIds)
    }
    if (commentIds) {
      console.log(`comments: ${JSON.stringify(commentIds)}`)
      ticket.setComments(commentIds)
    }

    checkTicketCreateOrUpdatePrivileges(user, ticket)
    return ticket
  },
  deleteById: async (id) => {
    const ticket = await findById(id)
    checkTicketDeletePrivileges(user, ticket)
    await ticket.destroy()

    return null
  }
})

function checkTicketReadPrivileges(user, entity) {
  checkPrivileges(user, entity, allPrivileges.TICKET_READ_ANY, allPrivileges.TICKET_READ_OWN)
}

function checkTicketCreateOrUpdatePrivileges(user, entity) {
  checkPrivileges(user, entity, allPrivileges.TICKET_CREATE_OR_UPDATE_ANY, allPrivileges.TICKET_CREATE_OR_UPDATE_OWN)
}

function checkTicketDeletePrivileges(user, entity) {
  checkPrivileges(user, entity, allPrivileges.TICKET_DELETE_ANY, allPrivileges.TICKET_DELETE_OWN)
}

function checkPrivileges(user, entity, anyPrivilege, ownPrivilege) {
  const isOwnTicket = isOwnEntity(user, entity)
  if (!user.privileges.includes(anyPrivilege)
    && !user.privileges.includes(ownPrivilege)
    && !isOwnTicket) {
    accessDeniedAnyOrOwn(anyPrivilege, ownPrivilege)
  }
}

function isOwnEntity(user, entity) {
  return entity && typeof Object.keys(entity.getAuthor()).length === 0 && entity.getAuthor().getId() === user.profileId
}

function accessDeniedAnyOrOwn(privilegeAll, privilegeOwn) {
  throw Error(`Access denied - you have to have ${privilegeAll} privilege 
  or you need to be an author and have ${privilegeOwn} privilege.`)
}


async function findById(id) {
  const store = await storePromise
  return store.Ticket.findOne({
    where: {id: id},
    include: [
      {
        model: store.Profile,
        as: 'author'
      }
    ]
  })
}
