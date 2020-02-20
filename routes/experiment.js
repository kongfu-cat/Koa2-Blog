const router = require('koa-router')()
const experimentService = require('../service/experimentService')

const argv = process.execArgv.join();
const isDebug = argv.includes('inspect') || argv.includes('debug');

router.prefix('/experiment')

router.get('/', async (ctx, next) => {
  let experiments = await experimentService.list()
  await ctx.render('experiment', {experiments: experiments, isDebug: isDebug})
})
router.post('/list', async (ctx, next) => {
  let experiments = await experimentService.list()
  ctx.body = {experiments: experiments}
})


// 代码结果插入
router.get('/fragment', async (ctx, next) => {
  let id = ctx.request.query.id || '',
      elementId = ctx.request.query.elementId || '',
      width = ctx.request.query.width || '300',
      height = ctx.request.query.height || '150';
  let experiment = await experimentService.find({_id: id})
  experiment = experiment[0] || {}
  let iframeJs = `
  document.write('<div id="${id}"></div>')
  window.addEventListener('load', function(){
      var iframe = document.createElement('iframe');
      iframe.style.border = "none";
      iframe.width = ${width};
      iframe.height = ${height};
      document.getElementById('${id}').appendChild(iframe);

      var iframeDoc =  iframe.contentDocument ||  iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(\`<style>${experiment.css}<\/style>\`);
      iframeDoc.write(\`${experiment.html}\`);
      iframeDoc.write(\`<script>${experiment.js}<\/script>\`);
      iframeDoc.close();
    });
  `
  // 对文本中的</script>进行转义
  iframeJs = iframeJs.replace('</script>', '<\\/script>')
  ctx.body = iframeJs
})

// 代码结果插入, 通过iframe
router.get('/iframe', async (ctx, next) => {
  let id = ctx.request.query.id || '';
  let experiment = await experimentService.find({_id: id})
  experiment = experiment[0] || {}
  // 直接输出html文件
  let iframeJs =  
 `<!DOCTYPE html>
<html>
<head>
  <style>${experiment.css}</style>
</head>
  <body>
  ${experiment.html}
  <script>${experiment.js}</script>
  <script>
    
  </script>
</body>
</html>`
  ctx.body = iframeJs
})

// 设置仅在debug模式有效
if (isDebug) {
  router.post('/save', async (ctx, next) => {
    let exp = {js: ctx.request.body.js || '',
        css: ctx.request.body.css || '',
        html: ctx.request.body.html || '',
        tag: ctx.request.body.tag || '',
        theme: ctx.request.body.theme || '',
        title: ctx.request.body.title || '',
        date: new Date(),
        author: "kongfu_cat"
      };
    let experiments = experimentService.insert(exp)
    ctx.body = {experiments: experiments}
  })
  router.post('/update', async (ctx, next) => {
    let exp = {js: ctx.request.body.js || '',
        css: ctx.request.body.css || '',
        html: ctx.request.body.html || '',
        theme: ctx.request.body.theme || '',
        date: new Date(),
      },
      id = ctx.request.body.id || '';
    let experiments = experimentService.update({_id: id}, exp)
    ctx.body = {experiments: experiments}
  })
  router.post('/delete', async (ctx, next) => {
    let id = ctx.request.body.id || '';
    let experiments = experimentService.remove({_id: id});
    ctx.body = {experiments: experiments}
  })
}

router.post('/tree', async (ctx, next) => {
  let experiments = await experimentService.list()
  let node = []
  let tmp = {}
  for (let exp of experiments) {
    if (!tmp[exp.tag]) {
      tmp[exp.tag] = []
    }
    tmp[exp.tag].push({
      name: exp.title, id: exp._id 
    })
  }
  for (let tag in tmp) {
    node.push({
      name: tag, open: true, children: tmp[tag]
    })
  }
  ctx.body = node
})

router.post('/get-experiment', async function (ctx, next) {
  let id = ctx.request.body.experimentId || '';
  let experiments = await experimentService.find({_id: id})
  ctx.body = {experiments: experiments}
})
module.exports = router
