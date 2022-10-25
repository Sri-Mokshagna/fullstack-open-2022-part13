const router = require('express').Router()
const { Blog, User } = require('../models')
const { Op } = require('sequelize')
const { QueryTypes } = require('sequelize');
const jwt = require('jsonwebtoken')
const { sequelize } = require('../util/db')
const finBlog = async (req, res, next) => {
  console.log('etsin blogia id:llä', req.params.id);
  req.blog = await Blog.findByPk(req.params.id)
  console.log('blogi on', req.blog);
  next()
}
const extractorToken = (req, res, next) => {
  const authorization = req.get('authorization')
  console.log('authaus:', process.env.SECRET);
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), process.env.SECRET)
    } catch{
      return res.status(401).json({ error: 'token invalid!' })
    }
  }  else {
    return res.status(401).json({ error: 'token missing!' })
  }
  next()
}
router.get('/', async (req, res) =>
{
  let where = {}
  if (req.query.search) 
  {
    where = {
      [Op.or]: [
        {
          title: {
            [Op.iLike]: '%' + req.query.search + '%'
          } 
        },
        {
          author: {
            [Op.iLike]: '%' + req.query.search + '%'
          }
        }
    ]
    }
  }

  const blogs = await Blog.findAll({
    include: { 
      model: User,
      attributes: { exclude: ['userId'] }
    },
    where,
    order: sequelize.literal('likes DESC')
  })
  res.json(blogs)
})
router.post('/', extractorToken, async (req, res, next) => {
  const headerToken = req.headers.authorization.substring(7)
  const results = await sequelize.query(
    `SELECT * FROM active_sessions WHERE token = '${headerToken}'`,
    { type: QueryTypes.SELECT }
  )
  if (!results.length) {
    throw Error('Error: token not found!')
  }
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({ ...req.body, userId: user.id })
    res.json(blog)
  } catch(error) {
    next(error)
  }
})
router.get('/:id', finBlog, async (req, res) => {
  if (req.blog) {
    res.json(req.blog)
  } else {
    res.status(404).end()
  }
})
router.delete('/:id', finBlog, extractorToken, async (req, res, next) => {

  const headerToken = req.headers.authorization.substring(7)
  const results = await sequelize.query(
    `SELECT * FROM active_sessions WHERE token = '${headerToken}'`,
    { type: QueryTypes.SELECT }
  )
  if (!results.length) {
    throw Error('Cannot delete blog because invalid token!')
  }
  try {
    if (req.blog && req.blog.userId === req.decodedToken.id) {
      await req.blog.destroy()
      res.status(204).end()
    }
    else {
      console.log('incorrect token!');
      res.status(400).end()
    }
    
  } catch(error) 
  {
    next(error)
  }
})
router.put('/:id', finBlog, async (req, res, next) => {  
  try {
    if (req.blog) {
      req.blog.likes = req.body.likes
      await req.blog.save()
      res.json(req.blog)
    } else {
      res.status(404).end()
    }
  } catch(error) {
    next(error)
  }
})
router.put('/api/blogs/:id', async (req, res) => {
  res.send('moi')
})
module.exports = router