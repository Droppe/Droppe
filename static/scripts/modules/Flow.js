/**
 * Flow version 0.1
 * @author Robert Martone
 * @license MIT
 */

define(['Fiber'], function (Fiber) {
  return Fiber.extend(function () {
    var defaults = {
      /**
       * The element containing the cards
       * @type {jQuery}
       */
      container: null,
      /**
       * A css selector
       * @type {String}
       */
      selector: 'li',
      /**
       * The number of columns specified in your grid
       * @type {Number}
       */
      columns: 12
    }

    return {
      init: function (settings) {
        _.defaults(defaults, settings);

        this.columns = settings.columns;
        this.container = settings.container;
        this.items = this.container.children(settings.items);
      },
      execute: function () {
        var panels = [],
          containerWidth = this.container.width(),
          columnWidth = (containerWidth / this.columns),
          column = 0;

        this.container.removeClass('__FLOW__');

        _.each(this.items, function (panel, index) {
          var $panel = $(panel),
            height = $panel.height(),
            width = $panel.width(),
            span = Math.round(width / columnWidth),
            offsety,
            offsetx,
            above,
            pane;

          if(panels.length < this.columns) {
            offsety = 0;
          } else {
            above = panels[panels.length - this.columns];
            offsety = above.offsety + above.height;
          }

          offsetx = column * columnWidth;

          column = (span + column) % this.columns;

          pane = {
            offsety: offsety,
            height: height
          };

          for(var i = 0; i < span; i += 1) {
            panels.push(pane);
          }

          $panel.css({
            'top': offsety,
            'left': offsetx
          });
        }, this);

        this.container.addClass('__FLOW__');

        return this;
      }
    }
  });
});