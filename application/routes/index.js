module.exports = function (application) {
  var index = application.application.controllers.index;
  application.get('/', index.index);
};