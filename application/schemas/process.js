var mongoose = require('mongoose');

var Process = new mongoose.Schema({
  url: String,
  job: Number,
  created_at: {
    type : Date,
    default: Date.now
  },
  updated_at: {
    type : Date,
    default: Date.now
  }
});

Process.pre('save', function(next, done){
  this.updated_at = new Date().getTime();
  next();
});

mongoose.model('Process', Process);