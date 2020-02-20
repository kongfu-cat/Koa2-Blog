const router = require('koa-router')()
const Blog = require('../modal/blog.js')
const blogService = require('../service/blogService.js')

const marked = require('marked')

const send = require('koa-send');
const fs = require('fs');

router.prefix('/demo')

/**
 * Insert
 */
function insert() { 
  let blog = new Blog({ 
    title: "文章",
    url: "",
    abs: "这是系列文章的第一篇，也是非常重要的一篇，希望大家能读懂我想要表达的意思。 系列文章开篇概述 相对于其他编程语言来说，Python 生态中最突出的就是第三方库。任何一个及格的 Python 开发者都使用过至少 5 款第三方库。 就爬虫领域而言，必将用到的例如网络请求库 Reque",
    content: "这是系列文章的第一篇，也是非常重要的一篇，希望大家能读懂我想要表达的意思。 系列文章开篇概述 相对于其他编程语言来说，Python 生态中最突出的就是第三方库。任何一个及格的 Python 开发者都使用过至少 5 款第三方库。 就爬虫领域而言，必将用到的例如网络请求库 Reque",
    author: "空腹猫",
    date: "2019-10-23 11:33",
    view: "0" 
  });
    
  blog.save(function (err, res) {
    if (err) { 
      console.log("Error:" + err);
    } else { 
      console.log("Res:" + res); 
    }
  });
} 
/**
 * Delete
 */
function del(){ 
  let wherestr = {'author': '空腹猫'}; 
  Blog.remove(wherestr, function(err, res){ 
    if (err) { 
      console.log("Error:" + err); 
    } else { 
      console.log("Res:" + res); 
    } 
  }) 
} 
/**
 * Update
 */
function update(){ 
  let wherestr = {'author': '空腹猫'}; 
  let updatestr = {'title': '空腹猫NICE'}; 
  Blog.update(wherestr, updatestr, function(err, res){ 
    if (err) { 
      console.log("Error:" + err); 
    } else { 
      console.log("Res:" + res); 
    }
  })
} 
/**
 * Find
 */
function find(){ 
  let wherestr = {'author': '空腹猫'};
  return new Promise(function(resolve, reject){
    Blog.find(wherestr, function(err, res){
      if (err) { 
        console.log("Error:" + err); 
      } else { 
        resolve(res)
      } 
    }) 
  })
} 

router.get('/', async function (ctx, next) {
  var files = []
  var str=""
  files = await new Promise((resolve, reject)=>{
    fs.readdir('./upload/', function (err, res) {
      resolve(res)
    })
  })
  for(let file of files){
    str+=`<a href="/demo/download/${file}">下载 ${file}</a><br/>`
  }
  var mongoFiles=[]
  var mongoose = require('../utils/db.js')
  var Grid = require('gridfs-stream');
  var db = mongoose.connection.db;
  var gfs= Grid(db, mongoose.mongo);
  
  var mongoFiles = await new Promise((resolve, reject)=>{
    gfs.files.find({}).toArray(function (err, files) {
      resolve(files);
    })
  })  
  for(let file of mongoFiles){
    str+=`<a href="/demo/download-mongo/${file._id}">下载 ${file.filename} (${file.length} Byte)</a><br/>`
  }
  
  ctx.body = 
  `<a href="/demo/add">添加</a><br/>
  <a href="/demo/del">删除</a><br/>
  <a href="/demo/update">修改</a><br/>
  <a href="/demo/find">查找</a>
  <div>
    <img src="/demo/image-file.png" alt="image">
    <img src="/images/tmp1.png" alt="image">
  </div>
  <form action="/demo/upload" method="post" enctype="multipart/form-data">
      <label>上传至服务器upload文件夹</label><br/>
      <input type="file" name="file" id="file" value="" multiple="multiple" />
      <input type="submit" value="提交"/>
  </form>
  <form action="/demo/upload-mongo" method="post" enctype="multipart/form-data">
      <label>上传至服务器mongodb</label><br/>
      <input type="file" name="file" id="file" value="" multiple="multiple" />
      <input type="submit" value="提交"/>
  </form>
  `+str
})

router.get('/add', function (ctx, next) {
  blogService.insert({
    title: "文章添加测试",
    bid: "1",
    location: "tmp.md",
    img: "tmp1.png",
    abs: "文章添加测试",
    content: "**文章添加测试**<br/>![RUNOOB 图标](http://static.runoob.com/images/runoob-logo.png) <br/>![tmp1.png](/images/tmp1.png)",
    author: "空腹猫",
    date: "2019-10-23 11:33",
    view: "0" 
  })
  ctx.body = '添加OK'
})

router.get('/del', function (ctx, next) {
  del()
  ctx.body = '删除OK'
})

router.get('/update', function (ctx, next) {
  // update()
  var path = require('path')
  blogService.updateInfoByFile(`${path.resolve('./blog/blogInfo.json')}`)
  ctx.body = '修改OK'
})

router.get('/find', async function (ctx, next) {
  var res = await blogService.find({'author': '空腹猫'})
  ctx.body = res
})

router.get('/marked', function (ctx, next) {
  marked.setOptions({
      renderer: new marked.Renderer(),
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
  })
  ctx.body = marked('# Marked in browser\n\nRendered by **marked**.')
})

router.get('/image-file.png', async function(ctx, next){
  var Stream  = require('stream')
  var dest = Stream.PassThrough();
  var data = await new Promise(function (resolve, reject) {
    var mongoose = require('../utils/db.js')
    var Grid = require('gridfs-stream');
    var db = mongoose.connection.db;
    var gfs= Grid(db, mongoose.mongo);
    var gfs_options = {
        "filename" : "tmp1.png"
    };
    var readerStream = gfs.createReadStream(gfs_options);
    // readerStream.on('data', function (chunk) {
    //   data+=chunk
    // })
    // readerStream.on('close', function () {
    //   resolve(data)
    // })
    readerStream.pipe(dest)
    readerStream.on('close', function () {
      resolve(dest)
    })
  })
  ctx.type = 'image/png';
  ctx.body = data
})

const koaBody = require('koa-body')
router.post('/upload', koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 200*1024*1024 // 设置上传文件大小最大限制，默认2M
    }
  }), async function (ctx, next){
  /**
   * 新版本的koa-body通过ctx.request.files获取上传的文件
   * 旧版本的koa-body通过ctx.request.body.files获取上传的文件
   */
  const file = ctx.request.files.file; // 获取上传文件
  const reader = fs.createReadStream(file.path); // 创建可读流
  const ext = file.name.split('.').pop(); // 获取上传文件扩展名
  const upStream = fs.createWriteStream(`upload/${new Date().valueOf().toString()}.${ext}`); // 创建可写流
  reader.pipe(upStream); // 可读流通过管道写入可写流
  return ctx.body = '上传成功';
})

router.get('/download/:name', async function (ctx, next){
 const name = ctx.params.name;
 const path = `upload/${name}`;
 ctx.attachment(path);
 await send(ctx, path);
})

router.get('/download-mongo/:id', async function (ctx, next){
 const id = ctx.params.id;
 var Stream  = require('stream')
 var dest = Stream.PassThrough();
 var data = await new Promise(async function (resolve, reject) {
   var mongoose = require('../utils/db.js')
   var Grid = require('gridfs-stream');
   var db = mongoose.connection.db;
   var gfs= Grid(db, mongoose.mongo);
   var gfs_options = {
       "_id" : require('mongoose').Types.ObjectId(id)
   };
   var mongoFiles = await new Promise(function (resolve, reject){
     gfs.files.findOne(gfs_options, function (err, file) {
       resolve(file);
     })
   }) 
   ctx.attachment(mongoFiles.filename)
   
   var readerStream = gfs.createReadStream(gfs_options);
   readerStream.pipe(dest)
   readerStream.on('close', function () {
     resolve(dest)
   })
 })
 ctx.body = data
})

router.post('/upload-mongo', koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 200*1024*1024 // 设置上传文件大小最大限制，默认2M
    }
  }), async function (ctx, next){
  const file = ctx.request.files.file; // 获取上传文件
  const reader = fs.createReadStream(file.path); // 创建可读流
  const ext = file.name.split('.').pop(); // 获取上传文件扩展名
  
  var mongoose = require('../utils/db.js')
  var Grid = require('gridfs-stream');
  var db = mongoose.connection.db;
  var gfs= Grid(db, mongoose.mongo);
  var writestream = gfs.createWriteStream({
      filename: `${new Date().valueOf().toString()}.${ext}`
  });
  reader.pipe(writestream);
  return ctx.body = '上传成功';
})

module.exports = router
