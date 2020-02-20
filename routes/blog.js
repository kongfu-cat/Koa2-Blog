const router = require('koa-router')()
const blogService = require('../service/blogService.js')
const fs = require('fs')
const path = require('path')
const marked = require('marked')
const moment = require('moment')
router.prefix('/blog')

router.get('/:bid', async function (ctx, next) { 
  let article = await blogService.findById(ctx.params.bid)
  let tags = await blogService.findTags()
  let dates = await blogService.findDates()
  if (article) {
    let render = new marked.Renderer()
    marked.setOptions({
        renderer: render,
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false
    })
    // 将数据库中的 \n 替换 为实际的 \n
    // article.content = article.content.replace(/\\n/g,'\n')
    // 获取本地markdown文件
    var data = fs.readFileSync(`${path.resolve('./blog/'+article.location)}`);
    // 对图片路径进行转换
    data = data.toString().replace("../public/images/", "/images/")
    article.dateString = moment(article.date).format('YYYY-MM-DD');
    article.content = await marked(data)
    await ctx.render('blog', {
      article: article,
      tags: tags,
      dates: dates
    })
  } else {
    ctx.response.redirect('/index'); 
  }
})

router.post('/get-blog', async function (ctx, next) {
  let page = ctx.request.body.page || 1;
  let pageSize = ctx.request.body.pageSize || 1;
  let condition = ctx.request.body.condition || {}
  let articles = await blogService.findByPager({
    condition: condition,
    page: page,
    pageSize: pageSize
  })
  ctx.body = {articles: articles}
})



router.post('/get-blog-by-tag', async (ctx, next) => {
  let tag = ctx.request.body.tag || '';
  let page = ctx.request.body.page || 1;
  let pageSize = ctx.request.body.pageSize || 1;
  let condition = ctx.request.body.condition || {}
  let articles = await blogService.findByTag({
    tag: tag,
    condition: condition,
    page: page,
    pageSize: pageSize
  })
  ctx.body = {articles: articles}
})

router.post('/get-blog-by-date', async (ctx, next) => {
  let date = ctx.request.body.date || '';
  let page = ctx.request.body.page || 1;
  let pageSize = ctx.request.body.pageSize || 1;
  let condition = ctx.request.body.condition || {}
  let articles = await blogService.findByDate({
    date: date,
    condition: condition,
    page: page,
    pageSize: pageSize
  })
  ctx.body = {articles: articles}
})
module.exports = router
