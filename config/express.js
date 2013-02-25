var express = require('express'),
  path = require('path');

module.exports = function (application) {
  application.configure(function () {
    application.set('port', process.env.PORT);
    application.set('view engine', 'html');
    application.engine('html', require('hbs').__express);
    application.set('views', __dirname + '/../application/views');
    application.set('partials', __dirname + '/../application/views/partials');
    application.set('helpers', __dirname + '/../application/views/helpers');
    application.set('hbs-blocks', {});
    application.use(express.favicon(__dirname + '/../static/favicon.ico'));
    application.use(express.logger('dev'));
    application.use(express.bodyParser());
    application.use(express.methodOverride());
    application.use(express.cookieParser('beluga'));
    application.use(express.session());
    application.use(application.router);
    application.use(express.static(path.join(__dirname, '/../static')));
  });
};