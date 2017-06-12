'use strict';

System.register(['d3', 'jquery', 'lodash', 'moment', './formatting'], function (_export, _context) {
  "use strict";

  var d3, $, _, moment, valueFormatter, _createClass, TOOLTIP_PADDING_X, TOOLTIP_PADDING_Y, CarpetplotTooltip;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_d) {
      d3 = _d.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_formatting) {
      valueFormatter = _formatting.valueFormatter;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      TOOLTIP_PADDING_X = 30;
      TOOLTIP_PADDING_Y = 5;

      CarpetplotTooltip = function () {
        function CarpetplotTooltip(elem, scope) {
          _classCallCheck(this, CarpetplotTooltip);

          this.tooltip = null;
          this.scope = scope;
          this.dashboard = scope.ctrl.dashboard;
          this.panel = scope.ctrl.panel;
          this.carpetPanel = elem;
          this.mouseOverPoint = false;

          elem.on('mouseover', this.onMouseOver.bind(this));
          elem.on('mouseleave', this.onMouseLeave.bind(this));
        }

        _createClass(CarpetplotTooltip, [{
          key: 'onMouseOver',
          value: function onMouseOver(e) {
            if (!this.panel.tooltip.show || !this.scope.ctrl.data || !this.scope.ctrl.data.data) {
              return;
            }

            if (!this.tooltip) {
              this.add();
              this.move(e);
            }
          }
        }, {
          key: 'onMouseLeave',
          value: function onMouseLeave() {
            this.destroy();
          }
        }, {
          key: 'onMouseMove',
          value: function onMouseMove(e) {
            if (!this.panel.tooltip.show) {
              return;
            }

            this.move(e);
          }
        }, {
          key: 'add',
          value: function add() {
            this.tooltip = d3.select('body').append('div').attr('class', 'carpet-tooltip graph-tooltip grafana-tooltip');
          }
        }, {
          key: 'destroy',
          value: function destroy() {
            if (this.tooltip) {
              this.tooltip.remove();
            }

            this.tooltip = null;
          }
        }, {
          key: 'show',
          value: function show(pos, data) {
            if (!this.panel.tooltip.show || !data) {
              return;
            }
            // shared tooltip mode
            if (pos.panelRelY) {
              return;
            }

            if (!this.isInChart(pos) || !this.tooltip) {
              this.destroy();
              return;
            }

            var bucket = this.getBucket(pos, data);
            if (!bucket) {
              this.destroy();
              return;
            }

            var tooltipTimeFormat = 'ddd YYYY-MM-DD HH:mm:ss';
            var time = this.dashboard.formatDate(bucket.time, tooltipTimeFormat);
            var decimals = this.panel.tooltip.decimals || 5;
            var format = this.panel.yAxis.format;
            var formatter = valueFormatter(format, decimals);
            var value = formatter(bucket.value);

            var tooltipHtml = '\n      <div class=\'graph-tooltip-time\'>' + time + '</div>\n      <div>\n      value: <b>' + value + '</b><br/>\n      </div>\n    ';

            this.tooltip.html(tooltipHtml);

            this.move(pos);
          }
        }, {
          key: 'isInChart',
          value: function isInChart(pos) {
            var offsetX = pos.offsetX,
                offsetY = pos.offsetY;
            var _scope = this.scope,
                yAxisWidth = _scope.yAxisWidth,
                chartWidth = _scope.chartWidth,
                chartTop = _scope.chartTop,
                chartHeight = _scope.chartHeight;


            return offsetX > yAxisWidth && offsetX < yAxisWidth + chartWidth && offsetY > chartTop && offsetY < chartTop + chartHeight;
          }
        }, {
          key: 'getBucket',
          value: function getBucket(pos, data) {
            var offsetX = pos.offsetX,
                offsetY = pos.offsetY;
            var _scope2 = this.scope,
                yAxisWidth = _scope2.yAxisWidth,
                chartTop = _scope2.chartTop,
                fragment = _scope2.fragment,
                xFrom = _scope2.xFrom;


            var xTime = this.scope.xScale.invert(offsetX - yAxisWidth);
            var yTime = this.scope.yScale.invert(offsetY - chartTop);

            var dayIndex = moment(xTime).startOf('day').diff(xFrom, 'days');
            var bucketIndex = fragment.getBucketIndex(moment(yTime));

            return _.has(data, 'data[' + dayIndex + '].buckets[' + bucketIndex + ']') ? {
              time: fragment.getTime(data.data[dayIndex].time, bucketIndex),
              value: data.data[dayIndex].buckets[bucketIndex]
            } : null;
          }
        }, {
          key: 'move',
          value: function move(pos) {
            if (!this.tooltip) {
              return;
            }

            var elem = $(this.tooltip.node())[0];
            var tooltipWidth = elem.clientWidth;
            var tooltipHeight = elem.clientHeight;

            var left = pos.pageX + TOOLTIP_PADDING_X;
            var top = pos.pageY + TOOLTIP_PADDING_Y;

            if (pos.pageX + tooltipWidth + 40 > window.innerWidth) {
              left = pos.pageX - tooltipWidth - TOOLTIP_PADDING_X;
            }

            if (pos.pageY - window.pageYOffset + tooltipHeight + 20 > window.innerHeight) {
              top = pos.pageY - tooltipHeight - TOOLTIP_PADDING_Y;
            }

            return this.tooltip.style('left', left + 'px').style('top', top + 'px');
          }
        }]);

        return CarpetplotTooltip;
      }();

      _export('default', CarpetplotTooltip);
    }
  };
});
//# sourceMappingURL=tooltip.js.map
