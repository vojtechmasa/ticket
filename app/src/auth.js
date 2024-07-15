const configPromise = require('./config')

const rolesHeaderName = 'X-Roles'
const userIdHeaderName = 'X-User-ID'

exports.allPrivileges = {
  TICKET_READ_OWN: 'TICKET_READ_OWN',
  TICKET_READ_ANY: 'TICKET_READ_ANY',
  TICKET_CREATE_OR_UPDATE_OWN: 'TICKET_CREATE_OR_UPDATE_OWN',
  TICKET_CREATE_OR_UPDATE_ANY: 'TICKET_CREATE_OR_UPDATE_ANY',
  TICKET_DELETE_OWN: 'TICKET_DELETE_OWN',
  TICKET_DELETE_ANY: 'TICKET_DELETE_ANY'
}

exports.userPromise = async (req) => {
  const config = await configPromise
  const roleMapping = config.ticket.roleMapping

  const roles = req.get(rolesHeaderName).split(',')
  const privileges = roles
    .filter(r => roleMapping[r] !== undefined)
    .map(r => roleMapping[r].privileges)
    .flat(1)
  const profileId = parseInt(req.get(userIdHeaderName), 10)

  return {privileges, profileId}
}
