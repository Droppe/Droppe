var config = require('./config').oembed,
  OEmbed = require('mongoose').model('OEmbed'),
  oembed = require('oembed'),
  _ = require('underscore');

oembed.EMBEDLY_KEY = config.EMBEDLY_KEY;

require('kue').createQueue().process('oembed', 10, function (job, done) {
  var url = job.data.url;
  OEmbed.findOne({url: url}).exec(function (err, embed) {
    if (err) return done(err);

    if (!embed) {
      embed = new OEmbed({url: url});

      embed.save(function () {
        oembed.fetch(url, {format:'json'}, function (err, result) {
          if (err) return done(err);
          if (result) {
            embed = _.extend(embed, result);
            embed.save(function () {
              done();
            });
          }
        });
      });
    } else {
      done();
    }
  });
});