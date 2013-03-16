var Kue = require('kue'),
  Job = Kue.Job,
  jobs = Kue.createQueue(),
  //Deferred
  Deferred = require('promised-io/promise').Deferred,
  //ODM
  mongoose = require('mongoose'),
  //Schemas
  Search = mongoose.model('Search'),
  Result = mongoose.model('Result'),
  Process = mongoose.model('Process');

//Start Article Processors
require('../jobs/article/article');

//Start Search Processor
require('../jobs/search/search');

function process(url) {
  var deferred = new Deferred();
  Process.findOne({ url: url }).exec(function (err, process) {
    if (err) {
      throw err;
    }

    var articleJob;

    if (!process) {
      process = new Process({url: url});
      process.save();

      articleJob = jobs.create('article', {
        title: 'Processing Article ::' + url,
        url: url
      });

      articleJob.on('complete', function () {
        process.remove();
        deferred.resolve();
      });

      articleJob.save();
    }
  });
  return deferred.promise;
}

exports.view = function (request, response) {
  var query = request.param('query');

  if (!query) {
    response.redirect('/');
    return;
  }

  Search.findOne({ query: query }).exec(function (err, search) {
    if (err) {
      throw err;
    }

    if (search) {
      response.redirect('/?query=' + query);
    } else {
      response.redirect('/search/create?query=' + query);
    }
  });
};

exports.create = function (request, response) {
  var query = request.param('query'),
    search;

  search = jobs.create('search', {
    title: 'Processing ::' + query,
    query: query
  });

  search.on('complete', function () {
    Result.find({processed: false}, function (err, results) {
      if (err) {
        throw err;
      }

      results.forEach(function (result, index) {
        process(result.url);
        result.processed = true;
        result.save();
      });
    });
    response.redirect('/?query=' + query);
  });

  search.save();
};