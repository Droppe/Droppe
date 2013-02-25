var hbs = require('hbs');

module.exports = function (application) {
  var blocks = application.get('hbs-blocks');

  hbs.registerHelper('extend', function (name, context) {
    var block = blocks[name];
    if (!block) {
      block = blocks[name] = [];
    }
    block.push(context.fn(this));
  });
};