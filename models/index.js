const Blogs = require('./blog')
const User = require('./user')
const UserReadings = require('./userreadings')
User.hasMany(Blogs)
Blogs.belongsTo(User)
User.belongsToMany(Blogs, { through: UserReadings, as: 'user_readings' }) 
Blogs.belongsToMany(User, { through: UserReadings, as: 'readed_blogs' })
module.exports = {
  Blogs, User, UserReadings
}