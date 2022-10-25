const router = require('express').Router()
const { query } = require('express');
const { QueryTypes } = require('sequelize');
const { Blog } = require('../models')
const { sequelize } = require('../util/db')
router.get('/', async (req, res) => {
  const results = await sequelize.query(
    "SELECT author, COUNT(author) as articles, sum(likes) as likes FROM blogs GROUP BY author ORDER BY likes DESC",
    { type: QueryTypes.SELECT })
  res.json(results)
})
module.exports = router