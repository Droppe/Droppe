var EventEmitter = require('events').EventEmitter,
  oembed = require('oembed'),
  _ = require('underscore');

oembed.EMBEDLY_KEY = '6fed632213d44dcb98cb860fabb33e7f';

function OEmbedFetcher() {
  EventEmitter.call(this);
}

OEmbedFetcher.prototype.__proto__ = EventEmitter.prototype;

/**
 * Gets an oembed based on a url. Emits a 'complete' passing the oembed as a
 * first param. If an oembed cannot be fetched 'error' is emitted with.
 * @param {String} url a fully qualified url.
 * @chainable
 */
OEmbedFetcher.prototype.fetch = function (url) {
  var Model = require('mongoose').model('OEmbed'),
    self = this;

  Model.findOne({url: url}).exec(function (err, model) {
    if (err) {
      return self.emit('error', err);
    }

    // We found a stored oembed for this url so well pass that along
    if (model) {
      return self.emit('complete', model);
    }

    // Fetch a new oembed
    require('oembed').fetch(url, {format:'json'}, function (err, result) {
      if (err) {
        return self.emit('error', err);
      }

      if (result) {
        // We were able to fetch an oembed
        model = new Model(result);
        model.save(function () {
          // pass the new oembed along
          self.emit('complete', model);
        });
        return;
      }

      // We were ubable to fetch an oembed
      return self.emit('error', 'The oembed service failed.');
    });
  });

  return this;
};

module.exports = OEmbedFetcher;