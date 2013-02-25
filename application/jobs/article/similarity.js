var config = require('./config'),
  mongoose = require('mongoose'),
  OEmbed = mongoose.model('OEmbed'),
  Article = mongoose.model('Article');

require('kue').createQueue().process('article', 10, function (job, done) {
  var url = job.data.url;

  OEmbed.findOne({ url:url }).exec(function (err, oembed) {
    if (err) return done(err);

    Article.findOne({ oembed:oembed._id }).exec(function (err, article) {
      if (err) return done(err);

      if(!article) {
        article = new Article({ url: url, oembed: oembed.id}).save(function () {
          return done();
        });
      } else {
        return done();
      }
    });

  });
});