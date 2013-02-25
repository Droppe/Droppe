var hbs = require('hbs');

module.exports = function (application) {
  hbs.registerHelper('partial', function (name, context) {
    var handlebars = hbs.handlebars,
      partial = handlebars.partials[name];

    if(partial) {
      return new handlebars.compile(partial)(this);
    } else {
      return 'Partial not loaded';
    }
  });
};