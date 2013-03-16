var mongoose = require('mongoose');

var Provider = new mongoose.Schema({
  url: String,
  name: String,
  created_at: {
    type : Date,
    default: Date.now
  },
  updated_at: {
    type : Date,
    default: Date.now
  }
});

Provider.pre('save', function(next, done){
  this.updated_at = new Date().getTime();
  next();
});

mongoose.model('Provider', Provider);