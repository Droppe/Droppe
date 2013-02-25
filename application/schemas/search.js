var mongoose = require('mongoose');

var Search = new mongoose.Schema({
  query: String,
  tapped_at: {
    type : Date,
    default: Date.now
  },
  invoke_count: {
    type: Number,
    default: 1
  },
  created_at: {
    type: Number,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

Search.pre('save', function(next, done){
  this.updated_at = new Date().getTime();
  next();
});

Search.methods.invoke = function () {
  this.invoke_count += 1;
  return this;
};

Search.methods.trajectory = function () {
  var velocity = this.velocity();
  return this.invoke_count / (velocity);
};

Search.methods.velocity = function () {
  return (this.invoke_count / this.dilation() * 10000);
};

Search.methods.dilation = function () {
  return Date.now() - new Date(this.tapped_at).getTime();
};

Search.methods.tap = function () {
  this.tapped_at = new Date().getTime();
  return this;
};

mongoose.model('Search', Search);