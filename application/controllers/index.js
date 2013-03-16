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

  function respond(articles) {
    response.render('stream', {
      title: 'Welcome to Droppe',
      articles: articles
    });
  }

  if (query) {
    Search.findOne({query: query}, function (err, search) {
      if (err) {
        throw err;
      }

      if (search) {
        Result.find({processed: true}, function (err, results) {
          if (err) {
            throw error;
          }

          if (results) {
            results.forEach(function (result) {
              var deferred,
                Model;

              if(result.searches.indexOf(search.id) > -1) {
                deferred = new Promise.Deferred();
                promises.push(deferred.promise);

                Model = Article.findOne({url:result.url});
                Model.populate('author');
                Model.populate('provider');

                Model.exec(function (err, article) {
                  if (err) {
                    throw err;
                  }

                  // console.log('------------------');
                  // console.log(article);
                  // console.log('------------------');

                  if (article) {
                    data.unshift(article);
                  }

                  deferred.resolve();
                });
              };
            });
          }

          Promise.all(promises).then(function (deferrals) {
            respond(data);
          });
        });
      } else {
        respond();
      }
    });
  } else {
    respond();
  }

};

