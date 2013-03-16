export.scrape = function (url, callback) {
  var io = require('node.io'),
    options = {timeout:10, auto_retry: true, jsdom: true};

  io.start(new io.Job(options, {
    input: false,
    run: function () {
      this.getHtml(url, function(err, $) {

        if (err) {
          callback(err);
        }

        function extract(e) {
          var text = [];

          e.each(function (index, item) {
            var $item = $(item);;
            $item.remove();
          });

          return text;
        }

        callback(null, {
          text: {}
        });
      });
    }
  }));
}