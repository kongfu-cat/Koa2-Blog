const Blog = require('../modal/blog.js')
const moment = require('moment');
/**
 * Insert
 */
function insert (object) {
  let blog = new Blog(object);
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
function remove (wherestr) {
  Blog.remove(wherestr, function (err, res) {
    if (err) {
      console.log("Error:" + err);
    } else {
      console.log("Res:" + res);
    }
  })
}
/**
 * update
 * @param {*} wherestr 
 * @param {*} updatestr 
 */
function update (wherestr, updatestr) {
  Blog.update(wherestr, updatestr, function (err, res) {
    if (err) {
      console.log("Error:" + err);
    } else {
      console.log("Res:" + res);
    }
  })
}

const fs = require('fs')
async function updateInfoByFile (path) {
  let blogs = fs.readFileSync(path),
    count = 0;
  for (let blog of JSON.parse(blogs)) {
    count++;

    blog.bid = blog.bid || count;
    blog.date = blog.date || new Date();
    blog.author = blog.author || "空腹猫";
    blog.delFlag = blog.delFlag || false;

    let options = { "upsert": true, "new": false };
    await Blog.findOneAndUpdate({ "bid": blog.bid }, blog, options, function (err, res) { })
  }
}
/**
 * Find
 */
async function find (wherestr) {
  wherestr = Object.assign({}, wherestr, { delFlag: { $ne: true } })
  var res = await Blog.find(wherestr)
  return res
}

async function findById (bid) {
  var res = await Blog.findOneAndUpdate({ "bid": bid }, { $inc: { "view": 1 } })
  return res
}
async function findByPager (options) {
  let page = options.page || 1;
  let pageSize = options.pageSize || 1;
  let condition = options.condition || {}
  condition = Object.assign({}, condition, { delFlag: { $ne: true } })
  page = parseInt(page)
  pageSize = parseInt(pageSize)
  console.log(options)
  var res = await Blog.find(condition).sort('-date').skip((page - 1) * pageSize).limit(pageSize)
  return res
}

async function findByTag (options) {
  options.condition = Object.assign(options.condition || {}, { tags: options.tag || '' });
  return findByPager(options)
}

async function findByDate (options) {
  let nextMonth = moment(options.date).add(1, 'months').format('YYYY-MM')
  options.condition = Object.assign(options.condition || {}, { date: { $gte: new Date(options.date), $lt: new Date(nextMonth) } });
  return findByPager(options)
}

async function findTags () {
  var res = await Blog.aggregate([{ $match: { delFlag: { $ne: true } } }, { $unwind: "$tags" }, { $group: { _id: "$tags", num: { $sum: 1 } } }])
  return res
}

async function findDates () {
  var res = await this.find()
  var mark = {}
  for (let blog of res) {
    date = moment(blog.date).format('YYYY-MM')
    if (mark[date] !== undefined) {
      mark[date] += 1
    } else {
      mark[date] = 1
    }
  }
  var result = []
  for (let date in mark) {
    result.push({ date: date, num: mark[date] });
  }
  return result
}

class BlogService {
  constructor() {
    this.find = find
    this.findByPager = findByPager
    this.remove = remove
    this.update = update
    this.updateInfoByFile = updateInfoByFile
    this.insert = insert
    this.findTags = findTags
    this.findDates = findDates
    this.findByTag = findByTag
    this.findByDate = findByDate
    this.findById = findById
  }
}

var blogService = new BlogService()

module.exports = blogService