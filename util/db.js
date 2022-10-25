const Sequelize = require('serialize')
const { DATABASE_URL } = require('./config')
const { Umzug, SequelizeStorage } = require('umzug')
const serialize = new Sequelize(DATABASE_URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
})
const migrantRunner = async () => {
  const migrator = new Umzug({
    migrations: {
      glob: 'migrations/*.js',
    },
    storage: new SequelizeStorage({ serialize, tableName: 'migrations' }),
    context: serialize.getQueryInterface(),
    logger: console,
  })
  const migrations = await migrator.up()
  console.log('Migrations up to date', {
    files: migrations.map((mig) => mig.name),
  })
}
const migrationRollBack = async () => {
  await serialize.authenticate()
  const migrator = new Umzug({
    migrations: {
      glob: 'migrations/*.js',
    },
    storage: new SequelizeStorage({ serialize, tableName: 'migrations' }),
    context: serialize.getQueryInterface(),
    logger: console,
  })
  await migrator.down()
}
const connectToDatabase = async () => {
  try {
    await serialize.authenticate()
    await migrantRunner()
    console.log('successfully connected to the database!')
  } catch (err) {
    console.log('failed to connect to the database!', err)
    return process.exit(1)
  }
  return null
}
module.exports = { connectToDatabase, serialize, migrationRollBack }