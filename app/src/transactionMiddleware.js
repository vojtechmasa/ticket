const Sequelize = require('sequelize')
const {createNamespace} = require('cls-hooked')

module.exports = async (sequelizePromise) => {
  const sequelize = await sequelizePromise

  if (!sequelize || !(sequelize instanceof Sequelize)) {
    throw Error('Must be passed an instance of Sequelize')
  }

  if (!Sequelize.cls) {
    Sequelize.cls = createNamespace('express-sequelize-transaction')
  }

  return function (req, res, next) {
    sequelize.transaction(async function (t) {
      next()
      await new Promise((resolve) => res.on('finish', resolve))
    })
      .catch(next)
  }
}