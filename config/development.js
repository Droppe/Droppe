var express = require('express'),
  mongoose = require('mongoose');

module.exports = function (application) {
  application.configure('development', function(){
    mongoose.connect('mongodb://localhost/lineup_dev');
    application.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });
};
