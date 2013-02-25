var Promise = require('promised-io/promise'),
  _ = require('underscore'),
  //ODM
  mongoose = require('mongoose'),
  //Schemas
  Article = mongoose.model('Article'),
  OEmbed = mongoose.model('OEmbed'),
  Search = mongoose.model('Search'),
  Result = mongoose.model('Result');

exports.index = function (request, response) {
  var data = [],
    promises = [],
    query = request.param('query');

  Search.findOne({query: query}, function (err, search) {
    if (err) throw err;
    Result.find({processed: true}, function (err, results) {
      var urls = [],
        promises = [];

      results.forEach(function (result, index) {
        var deferred = new Promise.Deferred();

        if(result.searches.indexOf(search.id) > -1) {
          promises.push(deferred.promise);
          Article.findOne({url:result.url}).populate('oembed').exec(function (err, article) {
            if (err) throw err;
            if (article) {
              data.unshift(article);
            }
            deferred.resolve();
          });
          Promise.all(promises).then(function (deferrals) {
            response.render('stream', {
              title: 'Welcome to Droppe',
              articles: data
            });
          });
        }
      });
    });
  });
};

