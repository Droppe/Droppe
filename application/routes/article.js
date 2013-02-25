module.exports = function (application) {
  var article = application.application.controllers.article;
  application.get('/article', article.view);
};