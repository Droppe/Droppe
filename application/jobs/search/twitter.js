var Promise = require('promised-io/promise'),
  querystring = require('querystring'),
  http = require('http'),
  url = require('url'),
  config = require('./config').twitter,
  mongoose = require('mongoose'),
  SearchModel = mongoose.model('Search'),
  ResultModel = mongoose.model('Result');


function findUrls(text) {
  var source = (text || '').toString(),
    urlArray = [],
    url,
    matchArray,
    regexp;

  // Regular expression to find FTP, HTTP(S) and email URLs.
  regexp = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;

  // Iterate through any URLs in the text.
  while((matchArray = regexp.exec(source)) !== null) {
    var token = matchArray[0];
    urlArray.push(token);
  }

  return urlArray;
}

module.exports = function (query) {
  var settings = config.SETTINGS,
    deferred = new Promise.Deferred(),
    results = [],
    stream,
    uri;

  uri = config.URL + encodeURIComponent(query + config.EXTRA);

  function request(callback) {
    http.request(url.parse(uri), function (response) {
      var results = [];

      response.setEncoding('utf8');

      response.on('data', function (chunk) {
        results.push(chunk);
      });

      response.on('end', function () {
        var meta = [];

        results = JSON.parse(results.join('')).results;

        results.forEach(function (result, index) {
          var urls = findUrls(result.text);
          urls.forEach(function (url) {
            meta.push({url: url});
          });
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
        ResultModel.findOne({url: item.url}, function (err, result) {
          if (err) { return };

          if (result) {
            result.searches.push(search.id);
            result.save(function () {
              deferred.resolve();
            });
            return;
          } else {
            result = new ResultModel({
              url: item.url,
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