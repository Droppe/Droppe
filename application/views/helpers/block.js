var hbs = require('hbs');

module.exports = function (application) {
  var blocks = application.get('hbs-blocks');

  hbs.registerHelper('block', function (name) {
    var val = (blocks[name] || []).join('\n');
    blocks[name] = [];
    return val;
  });
};