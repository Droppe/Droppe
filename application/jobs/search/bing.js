var Promise = require('promised-io/promise'),
  querystring = require('querystring'),
  https = require('https'),
  url = require('url'),
  config = require('./config').bing,
  mongoose = require('mongoose'),
  SearchModel = mongoose.model('Search'),
  ResultModel = mongoose.model('Result');

module.exports = function (query) {
  var settings = config.SETTINGS,
    deferred = new Promise.Deferred(),
    results = [],
    stream,
    uri;

  settings['Query'] = '\'' + query + '\'';

  uri = config.URL + '?' + querystring.stringify(settings);

  function request(callback) {
    https.request(url.parse(uri), function (response) {
      var results = [];

      response.setEncoding('utf8');

      response.on('data', function (chunk) {
        results.push(chunk);
      });

      response.on('end', function () {
        var meta = [];

        results = JSON.parse(results.join('')).d.results[0].News;

        results.forEach(function (result, index) {
          meta.push(result);
        });

        callback(meta);
      });
    }).end();
  }

  SearchModel.findOne({ query: query }).exec(function (err, search) {
    var dilation;

    if (err) { return };

    function result(meta) {
      var promises = [];
      meta.forEach(function (item, index) {
        var deferred = new Promise.Deferred();
        promises.push(deferred.promise);
        ResultModel.findOne({url: item.Url}, function (err, result) {
          if (err) { return };

          if (result) {
            result.searches.push(search.id);
            result.save(function () {
              deferred.resolve();
            });
            return;
          } else {
            result = new ResultModel({
              url: item.Url,
              searches: [search.id]
            }).save(function () {
              deferred.resolve();
            });
          }
        });
      });
      return Promise.all(promises);
    }

    if (search) {
      if(search.dilation() > config.THROTTLE) {
        search.invoke().tap().save(function() {
          request(function (meta) {
            result(meta).then(function () {
              deferred.resolve();
            })
          });
        });
      } else {
        search.invoke().save(function () {
          deferred.resolve();
        });
      }
    } else {
      search = new SearchModel({ query: query });
      search.save(function () {
        request(function (meta) {
          result(meta).then(function () {
            deferred.resolve();
          })
        });
      });
    }
  });

  return deferred.promise;
}