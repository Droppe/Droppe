var mongoose = require('mongoose'),
  Article;

Article = new mongoose.Schema({
  url: String,
  title: String,
  description: String,
  type: String,
  cache_age: Date,
  width: Number,
  height: Number,
  html: String,
  result: {type : mongoose.Schema.ObjectId, ref: 'Result'},
  oembed: {type : mongoose.Schema.ObjectId, ref: 'OEmbed'},
  provider: {type : mongoose.Schema.ObjectId, ref: 'Provider'},
  author: {type : mongoose.Schema.ObjectId, ref: 'Author'},
  created_at: {type : Date, default: Date.now},
  updated_at: {type : Date, default: Date.now}
});

Article.pre('save', function(next, done){
  this.updated_at = new Date().getTime();
  next();
});

mongoose.model('Article', Article);