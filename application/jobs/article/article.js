var Kue = require('kue').createQueue(),
  //Promise
  Promise = require('promised-io/promise'),
  //ODM
  mongoose = require('mongoose'),
  //Schemas
  Article = mongoose.model('Article'),
  OEmbed = mongoose.model('OEmbed');

Kue.process('article', 100, function (job, done) {
  var url = job.data.url;

  OEmbed.findOne({ url: url }).exec(function (err, oembed) {
    if (err) return done(err);

    if (oembed) {
      Article.findOne({oembed: oembed._id}).exec(function (err, article) {
        if (err) return done(err);

        if (!article) {
          article = new Article({
            url: url,
            oembed: oembed,
            author: {
              name: oembed.author_name,
              url: oembed.author_url
            },
            provider: {
              name: oembed.provider_name,
              url: oembed.provider_url
            }
          }).save(function () {
            return done();
          });
        } else {
          return done();
        }
      });
    }
  });
});