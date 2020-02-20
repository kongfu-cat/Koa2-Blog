const router = require('koa-router')()

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

router.get('/:uid', function (ctx, next) {
  ctx.body = 'this is a users response!' + ctx.params.uid;
})

module.exports = router
