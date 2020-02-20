const Experiment = require('../modal/experiment.js')
const moment = require('moment');

function insert (object) { 
  let experiment = new Experiment(object);
  experiment.save(function (err, res) {
    if (err) { 
      console.log("Error:" + err);
    } else { 
      console.log("Res:" + res); 
    }
  });
} 
async function find (wherestr) { 
  var res = await Experiment.find(wherestr)
  return res
}
async function list () { 
  var res = await Experiment.find({}, {'_id':1, 'title': 1, 'tag': 1})
  return res
}
function update (wherestr, updatestr) { 
  Experiment.update(wherestr, updatestr, function(err, res){ 
    if (err) { 
      console.log("Error:" + err); 
    } else { 
      console.log("Res:" + res); 
    }
  })
} 

function remove (wherestr) { 
  Experiment.remove(wherestr, function(err, res){ 
    if (err) { 
      console.log("Error:" + err); 
    } else { 
      console.log("Res:" + res); 
    } 
  }) 
} 
class ExperimentService {
  constructor() {
    this.list = list
    this.find = find
    this.remove = remove
    this.update = update
    this.insert = insert
  }
}

var experimentService = new ExperimentService()

module.exports = experimentService