const {Sequelize, DataTypes} = require('sequelize')

exports.sequelizePromise = createSequelize()

const storePromise = createStore()
exports.storePromise = storePromise

async function createSequelize() {
  const sqlUsername = process.env.TICKET_SQL_USERNAME
  const sqlPassword = process.env.TICKET_SQL_PASSWORD
  const domain = "ticket-sql"
  const port = 5432
  // const domain = "127.0.0.1"
  // const port = 65434
  const sequelize = new Sequelize(`postgres://${sqlUsername}:${sqlPassword}@${domain}:${port}/postgres?encoding=UTF8`,
    {
      logging(query, options, time) {
        console.log(query)
      },
      dialect: 'postgres',
      define: {
        freezeTableName: true, //use singular table name
      }
    }
  )

  try {
    await sequelize.authenticate()
    console.log('Connection to the database has been established successfully.')
    return sequelize
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    process.exit(1)
  }
}

async function createStore() {
  const sequelize = await exports.sequelizePromise

  const Ticket = sequelize.define("Ticket", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.BLOB,
      allowNull: false,
      get() {
        return this.getDataValue('description').toString('utf8');
      },
    },
    state: DataTypes.STRING,
    type: DataTypes.STRING,
    resolvedAt: DataTypes.DATE,
    reassignedAt: DataTypes.DATE
  })

  const Room = sequelize.define("Room", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    abbreviation: {
      type: DataTypes.STRING,
      allowNull: false
    }
  })

  const Profile = sequelize.define("Profile", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    frontDegree: DataTypes.STRING,
    firstNames: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastNames: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rearDegree: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
  })

  const Image = sequelize.define("Image", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: DataTypes.STRING,
    size: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    contentType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    blob: {
      type: DataTypes.BLOB,
      allowNull: false
    }
  })

  const Attachment = sequelize.define("Attachment", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: DataTypes.STRING,
    size: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    contentType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    blob: {
      type: DataTypes.BLOB,
      allowNull: false
    }
  })

  const Comment = sequelize.define("Comment", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    body: {
      type: DataTypes.BLOB,
      allowNull: false,
      get() {
        return this.getDataValue('body').toString('utf8');
      },
    }
  }, {
    tableName: 'Comments'
  })

  Room.hasMany(Ticket, {
    foreignKey: {
      allowNull: false,
      name: 'roomId'
    }
  })
  Ticket.belongsTo(Room, {
    foreignKey: {
      allowNull: false,
      name: 'roomId'
    }
  })

  Profile.hasMany(Ticket, {
    foreignKey: {
      allowNull: false,
      name: 'authorId'
    }
  })
  Ticket.belongsTo(Profile, {
    as: 'author',
    foreignKey: {
      allowNull: false,
      name: 'authorId'
    }
  })

  Profile.hasMany(Ticket, {
    foreignKey: {
      name: 'assigneeId'

    }
  })
  Ticket.belongsTo(Profile, {
    as: 'assignee',
    foreignKey: {
      name: 'assigneeId'
    }
  })

  Profile.belongsToMany(Ticket, {through: 'TicketWatchers', as: 'tickets', foreignKey: 'profileId'})
  Ticket.belongsToMany(Profile, {through: 'TicketWatchers', as: 'watchers', foreignKey: 'ticketId'})

  Image.belongsToMany(Ticket, {through: 'TicketImages', as: 'tickets'})
  Ticket.belongsToMany(Image, {through: 'TicketImages', as: 'images'})

  Attachment.belongsToMany(Ticket, {through: 'TicketAttachments', as: 'tickets'})
  Ticket.belongsToMany(Attachment, {through: 'TicketAttachments', as: 'attachments'})

  Comment.belongsToMany(Ticket, {through: 'TicketComments', as: 'tickets'})
  Ticket.belongsToMany(Comment, {through: 'TicketComments', as: 'comments'})

  //  This creates the tables if they don't exist (and does nothing if they already exist).
  // TODO remove force after development phase
  await sequelize.sync()

  return {
    Ticket,
    Room,
    Profile,
    Image,
    Attachment,
    Comment
  };
}
