const dateTime = require('node-datetime')
const bodyParser = require('body-parser')
const FileType = require('file-type')
const {ApolloServer} = require('apollo-server-express')
const {buildFederatedSchema} = require('@apollo/federation');
const express = require('express')
const {v4: UUIDv4} = require('uuid')

const {createTicketModel} = require('./model/ticket')
const {createProfileModel} = require('./model/profile')
const {createAttachmentModel} = require('./model/attachment')
const {createImageModel} = require('./model/image')
const {createCommentModel} = require('./model/comment')
const ImageModel = require('./model/image')
const AttachmentModel = require('./model/attachment')
const init = require('./init')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const transactionMiddleware = require('./transactionMiddleware')
const {sequelizePromise} = require('./database')
const {userPromise} = require('./auth')

const supportedImageMimeTypes = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png"
}

const supportedAttachmentMimeTypes = {
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.oasis.opendocument.presentation": "odp",
  "application/vnd.oasis.opendocument.spreadsheet": "ods",
  "application/vnd.oasis.opendocument.text": "odt",
  "application/pdf": "pdf",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/rtf": "rtf",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/zip": "zip",
}

const resourceFileNameHeaderName = 'x-augustin6-resource-file-name'

function currentDateTime() {
  return dateTime.create().format('Y-m-d H:M:S')
}

function error(res, httpCode, errorCode, culprit) {
  res.status(httpCode)
  res.json(
    {
      id: UUIDv4(),
      dateTime: currentDateTime(),
      responseErrorType: {
        code: errorCode,
        culprit: culprit,
        httpStatus: httpCode
      }
    }
  )
  return res
}

async function createApp() {
  const app = express()
  app.use(await transactionMiddleware(sequelizePromise))

  //TODO de-duplicate attachment and image
  app.get('/attachment/:id', async (req, res) => {
    const id = req.params.id
    if (!id) {
      console.log('Missing id for /attachment GET endpoint.')
      return error(res, 400, 10, "USER")
    }

    const attachment = await AttachmentModel.findById(id)

    res.setHeader('content-type', attachment.contentType)
    return res.send(attachment.blob)
  })

  app.get('/image/:id', async (req, res) => {
    const id = req.params.id
    if (!id) {
      console.log('Missing id for /image GET endpoint.')
      return error(res, 400, 10, "USER")
    }

    const image = await ImageModel.findById(id)

    res.setHeader('content-type', image.contentType)
    return res.send(image.blob)
  })

  app.post('/attachment', bodyParser.raw({
    keepExtensions: true,
    limit: 80 * 1024 * 1024,
    defer: true
  }), async (req, res) => {
    if (!req.is('application/octet-stream')) {
      console.log("Incorrect or missing Content-Type.")
      return error(res, 400, 10, "USER")
    }

    const buffer = await FileType.fromBuffer(req.body)
    if (!buffer) {
      console.log("Empty body in the request or file type not supported.")
      return error(res, 400, 10, "USER")
    }

    const {mime} = buffer
    if (!(mime in supportedAttachmentMimeTypes)) {
      console.log(`"${mime}" file type is not supported.`)
      return error(res, 400, 10, "USER")
    }

    const fileName = req.get(resourceFileNameHeaderName)
    const size = req.socket.bytesRead
    const attachment = await AttachmentModel.create(mime, req.body, size, fileName)

    return res.send(JSON.stringify(
      attachment,
      (k, v) => (k === 'blob') ? undefined : v)
    )
  })

  app.post('/image', bodyParser.raw({
    keepExtensions: true,
    limit: 20 * 1024 * 1024,
    defer: true
  }), async (req, res) => {
    if (!req.is('application/octet-stream')) {
      console.log("Incorrect or missing Content-Type.")
      return error(res, 400, 10, "USER")
    }

    const buffer = await FileType.fromBuffer(req.body)
    if (!buffer) {
      console.log("Empty body in the request or file type not supported.")
      return error(res, 400, 10, "USER")
    }

    const {mime} = buffer
    if (!(mime in supportedImageMimeTypes)) {
      console.log(`"${mime}" file type is not supported.`)
      return error(res, 400, 10, "USER")
    }

    const fileName = req.get(resourceFileNameHeaderName)
    const size = req.socket.bytesRead
    const attachment = await ImageModel.create(mime, req.body, size, fileName)

    return res.send(JSON.stringify(
      attachment,
      (k, v) => (k === 'blob') ? undefined : v)
    )
  })

  return app
}

function createApolloServer() {
  return new ApolloServer({
    context: async ({req}) => {
      const user = await userPromise(req)
      return {
        Ticket: createTicketModel(user),
        Profile: createProfileModel(user),
        Comment: createCommentModel(user),
        Attachment: createAttachmentModel(user),
        Image: createImageModel(user)
      }
    },
    schema: buildFederatedSchema([{typeDefs, resolvers}])
  })
}

const apolloServer = createApolloServer()
createApp().then((app) => {
  apolloServer.applyMiddleware({app: app})
  app.listen({port: 4000}, () =>
    console.log(`🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`)
  )
})

init.setSync()
