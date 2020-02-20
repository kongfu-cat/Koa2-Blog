/** * 用户信息 */ 
var mongoose = require('../utils/db.js'), 
Schema = mongoose.Schema; 
var BlogSchema = new Schema({
  bid: { type: String },
  title: { type: String },
  author: { type: String },
  tags: { type: Array},
  date: { type: Date},
  abs: { type: String },
  content: { type: String },
  location: { type: String },
  img: { type: String },
  view: {type: Number},
  delFlag: {type: Boolean}
}); 
module.exports = mongoose.model('Blog', BlogSchema);