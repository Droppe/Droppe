var express = require('express');

module.exports = function (application) {
  application.configure('production', function(){
    application.use(express.errorHandler());
  });
};