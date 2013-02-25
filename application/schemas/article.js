var mongoose = require('mongoose'),
  Article;

Article = new mongoose.Schema({
  url: String,
  oembed: {type : mongoose.Schema.ObjectId, ref: 'OEmbed'},
  provider: {
    url: String,
    name: String
  },
  author: {
    url: String,
    name: String
  },
  image: {
    url: String,
    height: Number,
    width: Number,
    quality: Number
  },
  created_at: {type : Date, default: Date.now},
  updated_at: {type : Date, default: Date.now}
});

Article.pre('save', function(next, done){
  this.updated_at = new Date().getTime();
  next();
});

mongoose.model('Article', Article);