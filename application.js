var load = require('express-load'),
  http = require('http'),
  express = require('express'),
  path = require('path'),
  application;

application = express();

load('config')
  .then('application/schemas')
  .then('application/controllers')
  .then('application/routes')
  .into(application);

//Start the application server
http.createServer(application).listen(application.get('port'), function(){
  console.log('>>> Express server listening on port ' + application.get('port'));
});

require('kue').app.listen(3000);
console.log('>>> KUE UI started on port 3000');