'use strict';

System.register(['d3', 'lodash', 'app/core/core', 'app/core/utils/ticks'], function (_export, _context) {
  "use strict";

  var d3, _, contextSrv, tickStep, _slicedToArray, DEFAULT_X_TICK_SIZE_PX, X_AXIS_TICK_PADDING, Y_AXIS_TICK_PADDING, MIN_SELECTION_WIDTH;

  function link(scope, elem, attrs, ctrl) {
    var data = void 0,
        panel = void 0,
        timeRange = void 0,
        carpet = void 0;

    var $carpet = elem.find('.carpetplot-panel');

    // const padding = { left: 0, right: 0, top: 0, bottom: 0 };
    var margin = { left: 25, right: 15, top: 10, bottom: 20 };

    var width = void 0,
        height = void 0,
        min = void 0,
        max = void 0,
        chartHeight = void 0,
        chartWidth = void 0,
        chartTop = void 0,
        chartBottom = void 0,
        xAxisHeight = void 0,
        yAxisWidth = void 0,
        yScale = void 0,
        xScale = void 0,
        colorScale = void 0;

    ctrl.events.on('render', function () {
      render();
      ctrl.renderingCompleted();
    });

    function addCarpetplot() {
      if (!data.data) {
        return;
      }

      addCarpetplotCanvas();
      addAxes();

      var _getMinMax = getMinMax();

      var _getMinMax2 = _slicedToArray(_getMinMax, 2);

      min = _getMinMax2[0];
      max = _getMinMax2[1];

      colorScale = getColorScale(min, max);
    }

    function addCarpetplotCanvas() {
      width = Math.floor($carpet.width());
      height = ctrl.height;

      if (carpet) {
        carpet.remove();
      }

      carpet = d3.select($carpet[0]).append('svg').attr('width', width).attr('height', height);
    }

    function addAxes() {
      chartHeight = height - margin.top - margin.bottom;
      chartTop = margin.top;
      chartBottom = chartTop + chartHeight;

      addYAxis();
      yAxisWidth = getYAxisWidth() + Y_AXIS_TICK_PADDING;
      chartWidth = width - yAxisWidth - margin.right;

      addXAxis();
      xAxisHeight = getXAxisHeight();

      // if (!panel.yAxis.show) {
      //   heatmap.select('.axis-y').selectAll('line').style('opacity', 0);
      // }

      // if (!panel.xAxis.show) {
      //   heatmap.select('.axis-x').selectAll('line').style('opacity', 0);
      // }
    }

    function addYAxis() {
      var yMin = 24;
      var yMax = 0;
      var ticks = 6;
      var tickInterval = tickStep(yMin, yMax, ticks);

      data.yAxis = {
        min: yMin,
        max: yMax,
        ticks: ticks
      };

      scope.yScale = yScale = d3.scaleLinear().domain([yMin, yMax]).range([chartHeight, 0]);

      var yAxis = d3.axisLeft(yScale).ticks(ticks).tickFormat(function (value) {
        return value.toString().padStart(2, '0') + ':00';
      }).tickSizeInner(0 - width).tickSizeOuter(0).tickPadding(Y_AXIS_TICK_PADDING);

      carpet.append('g').attr('class', 'axis axis-y').call(yAxis);

      var posY = margin.top;
      var posX = getYAxisWidth() + Y_AXIS_TICK_PADDING;

      var yAxisGroup = carpet.select('.axis-y');
      yAxisGroup.attr('transform', 'translate(' + posX + ',' + posY + ')');
      yAxisGroup.select('.domain').remove();
      yAxisGroup.selectAll('.tick line').remove();
    }

    function addXAxis() {
      scope.xScale = xScale = d3.scaleTime().domain([timeRange.from, timeRange.to]).range([0, chartWidth]);

      var ticks = chartWidth / DEFAULT_X_TICK_SIZE_PX;
      var grafanaTimeFormatter = grafanaTimeFormat(ticks, timeRange.from, timeRange.to);

      var xAxis = d3.axisBottom(xScale).ticks(ticks).tickFormat(d3.timeFormat(grafanaTimeFormatter)).tickPadding(X_AXIS_TICK_PADDING).tickSize(chartHeight);

      var posY = margin.top;
      var posX = yAxisWidth;
      carpet.append('g').attr('class', 'axis axis-x').attr('transform', 'translate(' + posX + ',' + posY + ')').call(xAxis);

      carpet.select('.axis-x').select('.domain').remove();
    }

    function getYAxisWidth() {
      var axisText = carpet.selectAll('.axis-y text').nodes();
      return d3.max(axisText, function (text) {
        return $(text).outerWidth();
      });
    }

    function getXAxisHeight() {
      var axisLine = carpet.select('.axis-x line');
      if (!axisLine.empty()) {
        var axisLinePosition = parseFloat(carpet.select('.axis-x line').attr('y2'));
        var canvasHeight = parseFloat(carpet.attr('height'));
        return canvasHeight - axisLinePosition;
      } else {
        // Default height
        return 30;
      }
    }

    function getMinMax() {
      var _panel$scale = panel.scale,
          min = _panel$scale.min,
          max = _panel$scale.max;

      return [isSet(min) ? min : data.stats.min, isSet(max) ? max : data.stats.max];
    }

    function getColorScale(min, max) {
      var colorScheme = _.find(ctrl.colorSchemes, { value: panel.color.colorScheme });
      var colorInterpolator = d3[colorScheme.value];
      var colorScaleInverted = colorScheme.invert === 'always' || colorScheme.invert === 'dark' && !contextSrv.user.lightTheme;

      var start = colorScaleInverted ? max : min;
      var end = colorScaleInverted ? min : max;

      return d3.scaleSequential(colorInterpolator).domain([start, end]);
    }

    function isSet(prop) {
      return prop !== undefined && prop !== null && prop !== '';
    }

    function render() {
      data = ctrl.data;
      panel = ctrl.panel;
      timeRange = ctrl.range;

      console.log(data);

      addCarpetplot();
    }
  }

  _export('default', link);

  function grafanaTimeFormat(ticks, min, max) {
    if (min && max && ticks) {
      var range = max - min;
      var secPerTick = range / ticks / 1000;
      var oneDay = 86400000;
      var oneYear = 31536000000;

      if (secPerTick <= 45) {
        return '%H:%M:%S';
      }
      if (secPerTick <= 7200 || range <= oneDay) {
        return '%H:%M';
      }
      if (secPerTick <= 80000) {
        return '%m/%d %H:%M';
      }
      if (secPerTick <= 2419200 || range <= oneYear) {
        return '%m/%d';
      }
      return '%Y-%m';
    }

    return '%H:%M';
  }
  return {
    setters: [function (_d2) {
      d3 = _d2.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreCore) {
      contextSrv = _appCoreCore.contextSrv;
    }, function (_appCoreUtilsTicks) {
      tickStep = _appCoreUtilsTicks.tickStep;
    }],
    execute: function () {
      _slicedToArray = function () {
        function sliceIterator(arr, i) {
          var _arr = [];
          var _n = true;
          var _d = false;
          var _e = undefined;

          try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
              _arr.push(_s.value);

              if (i && _arr.length === i) break;
            }
          } catch (err) {
            _d = true;
            _e = err;
          } finally {
            try {
              if (!_n && _i["return"]) _i["return"]();
            } finally {
              if (_d) throw _e;
            }
          }

          return _arr;
        }

        return function (arr, i) {
          if (Array.isArray(arr)) {
            return arr;
          } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
          } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
          }
        };
      }();

      DEFAULT_X_TICK_SIZE_PX = 100;
      X_AXIS_TICK_PADDING = 10;
      Y_AXIS_TICK_PADDING = 5;
      MIN_SELECTION_WIDTH = 2;
    }
  };
});
//# sourceMappingURL=rendering.js.map
