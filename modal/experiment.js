/** * 用户信息 */ 
var mongoose = require('../utils/db.js'), 
Schema = mongoose.Schema; 
var ExperimentSchema = new Schema({
  eid: { type: String },
  title: { type: String },
  html: { type: String},
  css: { type: String },
  js: { type: String },
  theme: { type: String }, 
  date: { type: Date},
  author: { type: String },
  tag: { type: String }
}); 
module.exports = mongoose.model('Experiment', ExperimentSchema);