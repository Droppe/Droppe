var fs = require('fs'),
  hbs = require('hbs');

module.exports = function (application) {
  var partials = application.get('partials') + '/',
    helpers = application.get('helpers') + '/';

  // Register Partials
  fs.readdirSync(partials).forEach(function (file) {
    var name = file.split('.' + application.get('view engine'))[0];
    hbs.registerPartial(name, fs.readFileSync(partials + file, 'utf8'));
  });

  // Register Helpers
  fs.readdirSync(helpers).forEach(function (file) {
    require(helpers + file)(application);
  });
}