var Kue = require('kue'),
  url = require('url'),
  bing = require('./bing'),
  twitter = require('./twitter'),
  promise = require('promised-io/promise');

function search(query) {
  var deferrals = [];
  if (!query) { return }

  deferrals.push(bing(query));
  deferrals.push(twitter(query));

  return promise.all(deferrals);
}

Kue.createQueue().process('search', 10, function (job, done) {
  search(job.data.query).then(function (deferrals) {
    job.log('Search completed');
    done();
  });
});