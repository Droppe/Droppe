var mongoose = require('mongoose');

var OEmbed = new mongoose.Schema({
  type: {type: String},
  version: {type: String},
  title: {type: String},
  author_name: {type: String},
  author_url: {type: String},
  provider_name: {type: String},
  provider_url: {type: String},
  cache_age: {type: String},
  thumbnail_url: {type: String},
  thumbnail_width: {type: String},
  thumbnail_height: {type: String},
  url: {type: String},
  width: {type: String},
  height: {type: String},
  html: {type: String},
  description: {type: String},
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

OEmbed.pre('save', function(next, done){
  this.updated_at = new Date().getTime();
  next();
});

mongoose.model('OEmbed', OEmbed);