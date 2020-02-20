const blogService = require('../service/blogService.js')
const mongoose = require('../utils/db.js')
const path = require('path')
const fs = require('fs');

(async function() {
  await blogService.updateInfoByFile(`${path.resolve('./blogInfo.json')}`)
  mongoose.connection.close()
})()

