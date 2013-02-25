var Deferred = require('promised-io/promise').Deferred,
  //ODM
  mongoose = require('mongoose'),
  //Schemas
  Article = mongoose.model('Article');

//Start Article Processors
require('../jobs/article/article');
require('../jobs/article/oembed');

function status(code) {
  return {
    404: {
      status: 404,
      message: 'The requested resource was not found'
    },
    202: {
      status: 202,
      message: "The request has been accepted for processing, but the processing has not been completed. The request might or might not eventually be acted upon, as it might be disallowed when processing actually takes place."
    }
  }[code];
}

exports.view = function (request, response) {
  var url = request.param('url');

  if (!url) {
    response.json(status(404));
    return;
  }

  response.locals.url = url;

  Article.findOne({ url: url }).exec(function (err, article) {
    if (err) throw err;

    if (article) {
      OEmbed.findById(article.oembed, function (err, result) {
        response.json({
          url: article.url,
          author: article.author,
          provider: article.provider,
          oembed: result
        });
      });
    } else {
      response.json(status(404));
    }
  });
};