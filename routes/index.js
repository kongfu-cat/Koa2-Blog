const router = require('koa-router')()
const blogService = require('../service/blogService.js')
const moment = require('moment')

router.get(['/', '/index'], async (ctx, next) => {
  let articles = await blogService.find({'author': '空腹猫'})
  let tags = await blogService.findTags()
  let dates = await blogService.findDates()
  await ctx.render('index', {
    articles: articles,
    tags: tags,
    dates: dates
  })
})

router.get('/about', async (ctx, next) => {
  await ctx.render('about')
})

module.exports = router
