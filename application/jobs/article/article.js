var Kue = require('kue').createQueue(),
  Mongoose = require('mongoose'),
  Promise = require('promised-io/promise'),
  EventEmitter = require('events').EventEmitter;

function Article() {
  EventEmitter.call(this);
}

Article.prototype.__proto__ = EventEmitter.prototype;

/**
 * Ensures a result with the given url
 * @param {String} url the result url
 * @return {Promise} a promise resolved when the result is found. The promises
 * is rejected if an error occurs or if the article as not associated with a
 * result
 */
function result(url) {
  var deferred = new Promise.Deferred(),
    ResultModel = Mongoose.model('Result');

  // Find the article's associated result
  ResultModel.findOne({url: url}).exec(function (err, model) {
    if (err || !model) {
      deferred.reject('could not find associated result');
      return;
    }

    deferred.resolve(model);
  });

  return deferred.promise;
}

/**
 * Ensures a provider with the given name and url
 * @param {String} name the name of the provider
 * @param {String} url the author's url
 * @return {Promise} a promise resolved when the provider is found or created.
 * The promise is rejected if an error occurs.
 */
function provider(name, url) {
  var deferred = new Promise.Deferred(),
    ProviderModel = Mongoose.model('Provider');

  ProviderModel.findOne({name: name, url: url}).exec(function (err, model) {
    if (err) {
      deferred.reject(err);
      return;
    }

    if (!model) {
      model = new ProviderModel({
        name: name, 
        url:url
      });
    }

    deferred.resolve({provider: model});
  });

  return deferred.promise;
}

/**
 * Ensures an author with the given name and url
 * @param {String} name the name of the author
 * @param {String} url the author's url
 * @return {Promise} a promise resolved when the author is found or created.
 * The promise is rejected if an error occurs.
 */
function author(name, url) {
  var deferred = new Promise.Deferred(),
    AuthorModel = Mongoose.model('Author');

  AuthorModel.findOne({name: name, url: url}).exec(function (err, model) {
    if (err) {
      deferred.reject(err);
      return;
    }

    if (!model) {
      model = new AuthorModel({
        name: name, 
        url:url
      });
    }

    deferred.resolve({author: model});
  });

  return deferred.promise;
}

/**
 * Ensures that the document is scrapped
 * @param {String} url the url of the document to scrape
 * @return {Promise} a promise resolved when the article is scrapped,
 * The promise is rejected if an error occurs.
 */
function scrape(url, provider) {
  var deferred = new Promise.Deferred(),
    process = require('provider/' + provider.toLowerCase());

  if (!process) {
    process = require('provider/default');
  }

  process.scrape(url, function (err, text) {
    if (err) {
      deferred.reject();
      return;
    }
    deferred.resolve({text: text});
  });

  return deferred.promise;
};

// {
//         text: {
//           paragraph: $('p').fulltext//,
//         //   anchor: $('a').text,
//         //   header: $('h1, h2, h3, h4, h5').text,
//         //   misc: $('b, big, i, small, tt, abbr, acronym, cite, code, dfn, em, kbd, strong, samp, var, q, span, td').text
//         }


/**
 * Derives an article from an oembed and then calls the callback with the
 * article.
 * @param {Object} oembed an oembed model
 * @param {Function} callback the callback to be called after creation
 * @chainable
 */
Article.prototype.create = function(oembed, callback) {

  function error(err) {
    callback(err);
  }

  function resolve(result) {
    var deferrals = [],
      article;

    article = {
      title: oembed.title,
      description: oembed.description,
      type: oembed.type,
      cache_age: oembed.cache_age,
      url: oembed.url,
      result: result.id,
      oembed: oembed.id,
    };

    if (['photo', 'video', 'rich'].indexOf(oembed.type) > -1) {
      article.width = oembed.width;
      article.height = oembed.height;

      if (oembed.html) {
        article.html = oembed.html;
      }
    }

    if (oembed.provider_name && oembed.provider_url) {
      deferrals.push(provider(oembed.provider_name, oembed.provider_url));
    }

    if (oembed.author_name && oembed.author_url) {
      deferrals.push(author(oembed.author_name, oembed.author_url));
    }

    deferrals.push(scrape(oembed.url));

    Promise.all(deferrals).then(function (deferrals) {

      deferrals.forEach(function (deferral) {
        for (var key in deferral) {
          if(deferral.hasOwnProperty(key)) {
            article[key] = deferral[key];
          }
        }
      });

      console.log('----------------------------------');
      console.log(article);
      console.log('----------------------------------');

      callback(null, article);

    }, error);
  }

  result(oembed.url).then(resolve, error);

  return this;
};

var nodeio = require('node.io');
exports.job = new nodeio.Job({
    input: false,
    run: function () {
        var url = this.options.args[0];
        this.get(url, function(err, data) {
            if (err) {
                this.exit(err);
            } else {
                this.emit(data);
            }
        });
    }
});

//Processor for the article job
Kue.process('article', 1, function (job, done) {
  var ArticleModel,
    Instance,
    url;

  if (!job.data || !job.data.url) {
    return done('url most be specified in job data.');
  }

  ArticleModel = Mongoose.model('Article');
  Instance = new Article();
  url = job.data.url;

  Instance.once('complete', function (article) {
    var Model = new ArticleModel(article);
    Model.save(function () {
      done();
    });
  });

  Instance.once('error', function (err) {
    done(err);
  });

  ArticleModel.findOne({url: url}).exec(function (err, article) {
    var OEmbedFetcher;

    if (err) {
      return Instance.emit('error', err);
    }

    if (article) {
      return Instance.emit('complete', article);
    }

    OEmbedFetcher = require('../../services/OEmbedFetcher');
    OEmbedFetcher = new OEmbedFetcher();

    OEmbedFetcher.once('error', function (err) {
      return Instance.emit('error', err); 
    });

    OEmbedFetcher.once('complete', function (oembed) {
      Instance.create(oembed, function(err, article) {
        if (err) {
          Instance.emit('error', err);
        }

        Instance.emit('complete', article);
      });
      return;
    });

    OEmbedFetcher.fetch(url);
  });

  return;
});