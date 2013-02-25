var mongoose = require('mongoose');

var Result = new mongoose.Schema({
  url: String,
  searches: [{type : mongoose.Schema.ObjectId, ref : 'Search'}],
  processed: {
    type: Boolean,
    default: false
  },
  created_at: {
    type : Date,
    default: Date.now
  },
  updated_at: {
    type : Date,
    default: Date.now
  }
});

Result.pre('save', function(next, done){
  this.updated_at = new Date().getTime();
  next();
});

mongoose.model('Result', Result);