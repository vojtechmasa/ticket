const {DateResolver, DateTimeResolver, EmailAddressResolver, VoidResolver} = require('graphql-scalars')
const {ticketTypes} = require('./init')

module.exports = {
  Query: {
    ticketTypes: (_, __, ___) => ticketTypes,
    ticketById: (_, {id}, {Ticket}) =>
      Ticket.findById(id),
    ticketsByFilter: (_, {filter, pageSpec}, {Ticket}) =>
      Ticket.findByFilter(filter, pageSpec),
    ticketCommentById: (_, {id}, {Comment}) =>
      Comment.findById(id),
    ticketCommentsByFilter: (_, {filter}, {Comment}) =>
      Comment.findByFilter(filter),
  },
  Mutation: {
    createOrUpdateTicketById: (_, {ticketInput}, {Ticket}) =>
      Ticket.createOrUpdateById(ticketInput),
    deleteTicketById: (_, {id}, {Ticket}) =>
      Ticket.deleteById(id)
  },
  Ticket: {
    assignee: (ticket, _, {Profile}) =>
      Profile.findById(ticket.assigneeId),
    watchers: (ticket, _, {Profile}) =>
      Profile.findWatchersByTicketId(ticket.id),
    attachments: (ticket, _, {Attachment}) =>
      Attachment.findAllByTicketId(ticket.id),
    images: (ticket, _, {Image}) =>
      Image.findAllByTicketId(ticket.id),
    comments: (ticket, _, {Comment}) =>
      Comment.findAllByTicketId(ticket.id),
  },

  EmailAddress: EmailAddressResolver,
  TicketDate: DateResolver,
  TicketDateTime: DateTimeResolver,
  Void: VoidResolver
}