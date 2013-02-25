require(['modules/Flow'], function (Flow) {
  $(function () {
    var $window = $(window),
      Layout;

    Layout = new Flow({ container: $('#stream'), columns: 12 }).execute();

    $window.on('resize', function () {
      Layout.execute();
    });

  });
});