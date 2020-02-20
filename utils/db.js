var mongoose = require('mongoose')
var mongodbConfig = require('../mongdb.config')
DB_URL = mongodbConfig.url; /** * 连接 */

mongoose.connect(DB_URL, {
  auth: mongodbConfig.auth,
  user: mongodbConfig.user,
  pass: mongodbConfig.pass,
})

mongoose.connection.on('connected', function () {

  console.log('Mongoose connection open to ' + DB_URL);
}); /** * 连接异常 */

mongoose.connection.on('error', function (err) {

  console.log('Mongoose connection error: ' + err);
}); /** * 连接断开 */

mongoose.connection.on('disconnected', function () {

  console.log('Mongoose connection disconnected');
});

module.exports = mongoose;