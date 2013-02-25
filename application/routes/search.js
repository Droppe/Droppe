module.exports = function (application) {
  var search = application.application.controllers.search;
  application.get('/search', search.view);
  application.get('/search/create', search.create);
};