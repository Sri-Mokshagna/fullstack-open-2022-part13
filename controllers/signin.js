const jwt = require('jsonwebtoken')
const router = require('express').Router()
const { sequelize } = require('../util/db')
const User = require('../models/user')
const { QueryTypes } = require('sequelize');
router.post('/', async (request, response) => {
  const body = request.body
  const user = await User.findOne({ 
    where: {
      username: body.username
    }
  })
  const correctPassword = body.password === 'secret'
  if (!(user && correctPassword)) {
    return response.status(401).json({
      error: 'invalid username or password!'
    })
  }
  const tokenForUser = {
    username: user.username,
    id: user.id,
  }
  const token = jwt.sign(tokenForUser, process.env.SECRET)
  try {
    await sequelize.query(
      `INSERT INTO active_sessions (token, username, name) VALUES ('${token}', '${user.username}', '${user.name}')`,
      { type: QueryTypes.INSERT })
  } catch(error) {
    return response.status(400).json({ error })
  }
  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})
module.exports = router