const configPromise = require('./config')
const {GraphQLClient, gql} = require('graphql-request')
const Room = require('./model/room')
const Profile = require('./model/profile')

const endpoint = 'http://gateway-app:8080/basicAuth/graphql'

exports.setSync = async () => {
  //setInterval(() => {
  await syncRooms()
  await syncProfiles()

  // })
}

exports.ticketTypesPromise = createTicketTypes()

// TODO read from file
async function createTicketTypes() {
  exports.ticketTypes = ['IT', 'janitor']
}

function createClient() {
  return new GraphQLClient(endpoint, {
    headers: {
      authorization: 'Basic YXBpOlNlY3JldDAwNyE=',
    },
  })
}

async function syncRooms() {
  const client = createClient()
  const query = gql`
      {
        rooms {id active name abbreviation}
      }
    `
  const ticketRoomInputs = (await client.request(query)).rooms
  await Room.createOrUpdateByIds(ticketRoomInputs)
}

async function syncProfiles() {
  const client = createClient()
  const query = gql`
      {
        cmsProfiles(filter: {employee: true} pageSpec: {first:0 count:1000000 order: []}) {items {id active frontDegree firstNames lastNames rearDegree email}}
      }
    `
  const ticketRoomInputs = (await client.request(query)).cmsProfiles.items
  await Profile.createOrUpdateByIds(ticketRoomInputs)
}