const {gql} = require('apollo-server-express')


module.exports = gql`
  scalar EmailAddress
  scalar TicketDate
  scalar TicketDateTime
  scalar Void
  
  type Ticket {
     id: ID!
     title: String!
     description: String!
     state: TicketState!
     type: String!
     room: TicketRoom
     author: TicketProfile!
     assignee: TicketProfile
     watchers: [TicketProfile!]!
     createdAt: TicketDateTime!
     updatedAt: TicketDateTime!
     resolvedAt: TicketDateTime
     reassignedAt: TicketDateTime
     attachments: [TicketResource!]!
     images: [TicketResource!]!
     comments: [TicketComment!]!
  }
  
  enum TicketState {
    NEW
    IN_PROGRESS
    DONE
    REJECTED
  }
  
  type TicketRoom {
   id: ID!
   active: Boolean!
   name: String!
   abbreviation: String!
  }
  
  type TicketProfile {
   id: ID!
   frontDegree: String
   firstNames: String!
   lastNames: String!
   rearDegree: String
   email: EmailAddress!
  }
  
  type TicketResource {
   id: ID!
   fileName: String!
   title: String
   size: Int!
   contentType: String!
  }
  
  type TicketComment {
   id: ID!
   ticket: Ticket!
   author: TicketProfile!
   body: String!
   createdAt: TicketDateTime!
  }
  
  type TicketsPage {
    first: Int!
    count: Int!
    totalCount: Int!
    items: [Ticket!]!
  }
  
  input TicketInput {
    id: ID
    title: String
    description: String
    state: TicketState
    type: String
    roomId: ID
    authorId: ID
    assigneeId: ID
    watcherIds: [ID!]
    resolvedAt: TicketDateTime
    reassignedAt: TicketDateTime
    attachmentIds: [ID!]
    imageIds: [ID!]
    commentIds: [ID!]
  }
  
  input TicketCommentInput {
    id: ID
    authorId: ID
    ticketId: ID
    body: String
  }
  
  input PageSpec {
    first: Int!
    count: Int!
    order: [Order!]!
  }
  
  input Order {
    by: String!
    direction: OrderDirection!
  }
  
  enum OrderDirection {
    ASCENDING
    DESCENDING
  }
  
  input TicketFilter {
    state: [TicketState!]
    ticketType: [String!]
    roomId: ID
    authorId: ID
    createdAt: TicketDateIntervalInput
    updatedAt: TicketDateIntervalInput
    resolvedAt: TicketDateIntervalInput
    reassignedAt: TicketDateIntervalInput 
  }
  
  input TicketCommentFilter {
  createdAt: TicketDateIntervalInput
  ticketId: ID
  ticketAssigneeId: ID
  ticketAuthorId: ID
  }
  
  input TicketDateIntervalInput {
    from: TicketDate
    to: TicketDate
  }
  
  input TicketRoomInput {
    id: ID
    active: Boolean
    name: String
    abbreviation: String
  }
  
  type Query {
    ticketTypes: [String!]!
    ticketById(id: ID!): Ticket
    ticketsByFilter(filter: TicketFilter, pageSpec: PageSpec!): TicketsPage!
    ticketCommentById(id: ID!): TicketComment
    ticketCommentsByFilter(filter: TicketCommentFilter): [TicketComment!]!
  }

  type Mutation {
    createOrUpdateTicketById(ticketInput: TicketInput!): Ticket!
    deleteTicketById(id: ID!): Void
    createOrUpdateTicketCommentById(ticketCommentInput: TicketCommentInput!): TicketComment!
    deleteTicketCommentById(id: ID!): Void
  }
`
