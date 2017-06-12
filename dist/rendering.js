'use strict';

System.register(['d3', 'lodash', 'app/core/core', 'app/core/utils/ticks', 'moment', 'jquery', './fragments', './tooltip'], function (_export, _context) {
  "use strict";

  var d3, _, appEvents, contextSrv, tickStep, moment, $, getFragment, CarpetplotTooltip, _slicedToArray, DEFAULT_X_TICK_SIZE_PX, X_AXIS_TICK_MIN_SIZE, Y_AXIS_TICK_PADDING, Y_AXIS_TICK_MIN_SIZE, MIN_SELECTION_WIDTH, LEGEND_HEIGHT, LEGEND_TOP_MARGIN;

  function link(scope, elem, attrs, ctrl) {
    var data = void 0,
        panel = void 0,
        timeRange = void 0,
        carpet = void 0;

    var $carpet = elem.find('.carpetplot-panel');
    var tooltip = new CarpetplotTooltip($carpet, scope);

    var margin = { left: 25, right: 15, top: 10, bottom: 65 };

    var width = void 0,
        height = void 0,
        min = void 0,
        max = void 0,
        xFrom = void 0,
        xTo = void 0,
        days = void 0,
        chartHeight = void 0,
        chartWidth = void 0,
        chartTop = void 0,
        chartBottom = void 0,
        xAxisHeight = void 0,
        yAxisWidth = void 0,
        yScale = void 0,
        xScale = void 0,
        legendHeight = void 0,
        colorScale = void 0,
        fragment = void 0,
        mouseUpHandler = void 0,
        originalPointColor = void 0;

    var selection = {
      active: false,
      x1: -1,
      x2: -1
    };

    ctrl.events.on('render', function () {
      render();
      ctrl.renderingCompleted();
    });

    function addCarpetplot() {
      if (!data.data) {
        return;
      }

      var _getMinMax = getMinMax();

      var _getMinMax2 = _slicedToArray(_getMinMax, 2);

      min = _getMinMax2[0];
      max = _getMinMax2[1];


      addCarpetplotCanvas();
      addAxes();
      addLegend();

      colorScale = getColorScale(min, max);

      addPoints(colorScale);
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
      legendHeight = panel.legend.show ? LEGEND_HEIGHT + LEGEND_TOP_MARGIN : 0;
      chartHeight = height - margin.top - margin.bottom - legendHeight;
      chartTop = margin.top;
      chartBottom = chartTop + chartHeight;

      addYAxis();
      yAxisWidth = getYAxisWidth() + Y_AXIS_TICK_PADDING;
      chartWidth = width - yAxisWidth - margin.right;

      addXAxis();
      xAxisHeight = getXAxisHeight();

      if (!panel.yAxis.show) {
        carpet.select('.axis-y').selectAll('line').style('opacity', 0);
      }

      if (!panel.xAxis.show) {
        carpet.select('.axis-x').selectAll('line').style('opacity', 0);
        carpet.selectAll('.axis-x-weekends').selectAll('line').style('opacity', 0);
      }
    }

    function addYAxis() {
      scope.yScale = yScale = d3.scaleTime().domain([moment().startOf('day').add(1, 'day').subtract(1, 'millisecond'), moment().startOf('day')]).range([chartHeight, 0]);

      var yAxis = d3.axisLeft(yScale).ticks(getYAxisTicks()).tickFormat(function (value) {
        return moment(value).format('HH:mm');
      }).tickSizeInner(0 - width).tickSizeOuter(0).tickPadding(Y_AXIS_TICK_PADDING);

      carpet.append('g').attr('class', 'axis axis-y').call(yAxis);

      var posY = margin.top;
      var posX = getYAxisWidth() + Y_AXIS_TICK_PADDING;

      var yAxisGroup = carpet.select('.axis-y');
      yAxisGroup.attr('transform', 'translate(' + posX + ',' + posY + ')');
      yAxisGroup.select('.domain').remove();
      yAxisGroup.selectAll('.tick line').remove();
    }

    function getYAxisWidth() {
      var axisText = carpet.selectAll('.axis-y text').nodes();
      return d3.max(axisText, function (text) {
        return $(text).outerWidth();
      });
    }

    function getYAxisTicks() {
      var count = chartHeight / Y_AXIS_TICK_MIN_SIZE;
      var step = Math.max(2, Math.ceil(24 / count));
      return d3.timeHour.every(step);
    }

    function addXAxis() {
      xFrom = moment(data.from.local()).startOf('day');
      xTo = moment(data.to.local()).startOf('day');
      days = xTo.diff(xFrom, 'days');

      scope.xScale = xScale = d3.scaleTime().domain([xFrom, xTo]).range([0, chartWidth]);

      var xAxis = d3.axisBottom(xScale).ticks(getXAxisTicks(xFrom, xTo)).tickFormat(d3.timeFormat('%a %m/%d')).tickSize(chartHeight);

      var posY = margin.top;
      var posX = yAxisWidth;
      carpet.append('g').attr('class', 'axis axis-x').attr('transform', 'translate(' + posX + ',' + posY + ')').call(xAxis).selectAll('text').style('text-anchor', 'end').attr('dx', '-.8em').attr('dy', '.15em').attr('y', 0).attr('transform', 'translate(5,' + (posY + chartHeight - 10) + ') rotate(-65)');
      carpet.select('.axis-x').selectAll('.tick line').remove();

      addDayTicks(posX, posY, d3.timeSaturday.every(1));
      addDayTicks(posX, posY, d3.timeMonday.every(1));
    }

    function addDayTicks(posX, posY, range) {
      var ticks = d3.axisBottom(xScale).ticks(range).tickSize(chartHeight);
      carpet.append('g').attr('class', 'axis-x-weekends').attr('transform', 'translate(' + posX + ',' + posY + ')').call(ticks).selectAll('text').remove();
      carpet.select('.axis-x-weekends .domain').remove();
    }

    function getXAxisHeight() {
      var axis = carpet.select('.axis-x');
      if (!axis.empty()) {
        var totalHeight = $(axis.node()).height();
        return Math.max(0, totalHeight - chartHeight);
      }
      return 0;
    }

    function getXAxisTicks(from, to) {
      var count = chartWidth / X_AXIS_TICK_MIN_SIZE;
      var step = Math.ceil(days / count);
      if (step < 7) {
        return d3.timeDay.every(1);
      }
      if (step < 28) {
        return d3.timeMonday.every(1);
      }
      return d3.timeMonth.every(1);
    }

    function addPoints(colorScale) {
      var container = carpet.insert('g', ':first-child').attr('class', 'carpet-container').attr('transform', 'translate(' + yAxisWidth + ',' + margin.top + ')');

      var cols = container.selectAll('.carpet-col').data(data.data).enter().append('g').attr('transform', function (day) {
        return 'translate(' + xScale(day.time.toDate()) + ',0)';
      });

      var width = chartWidth / days;
      var height = chartHeight / fragment.count;

      var pointScale = d3.scaleLinear().domain([fragment.count, 0]).range([chartHeight, 0]);

      var points = cols.selectAll('.carpet-point').data(function (d, i) {
        return d.buckets;
      }).enter().append('rect').attr('class', 'carpet-point').attr('fill', function (value) {
        return value === null ? panel.color.nullColor : colorScale(value);
      }).attr('x', 0).attr('y', function (d, i) {
        return pointScale(i);
      }).attr('width', width).attr('height', height).attr('title', function (d, i) {
        return i + ': ' + d;
      });

      var $points = $carpet.find('.carpet-point');
      $points.on('mouseenter', function (event) {
        tooltip.mouseOverPoint = true;
        highlightPoint(event);
      }).on('mouseleave', function (event) {
        tooltip.mouseOverPoint = false;
        resetPointHighLight(event);
      });
    }

    function highlightPoint(event) {
      var color = d3.select(event.target).style('fill');
      var highlightColor = d3.color(color).darker(1);
      var currentPoint = d3.select(event.target);
      originalPointColor = color;
      currentPoint.style('fill', highlightColor);
    }

    function resetPointHighLight(event) {
      d3.select(event.target).style('fill', originalPointColor);
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

    function onMouseDown(event) {
      selection.active = true;
      selection.x1 = event.offsetX;

      mouseUpHandler = function mouseUpHandler() {
        return onMouseUp();
      };

      $(document).one('mouseup', mouseUpHandler);
    }

    function onMouseUp() {
      $(document).unbind('mouseup', mouseUpHandler);
      mouseUpHandler = null;
      selection.active = false;

      var selectionRange = Math.abs(selection.x2 - selection.x1);

      if (selection.x2 >= 0 && selectionRange > MIN_SELECTION_WIDTH) {
        var timeFrom = xScale.invert(Math.min(selection.x1, selection.x2) - yAxisWidth);
        var timeTo = xScale.invert(Math.max(selection.x1, selection.x2) - yAxisWidth);

        ctrl.timeSrv.setTime({
          from: moment.utc(timeFrom),
          to: moment.utc(timeTo)
        });
      }

      clearSelection();
    }

    function onMouseLeave() {
      // appEvents.emit('graph-hover-clear');
      clearCrosshair();
    }

    function onMouseMove(event) {
      if (!carpet) {
        return;
      }

      if (selection.active) {
        clearCrosshair();
        tooltip.destroy();

        selection.x2 = limitSelection(event.offsetX);
        drawSelection(selection.x1, selection.x2);
      } else {
        drawCrosshair(event.offsetX);
        tooltip.show(event, data);
      }
    }

    function drawCrosshair(position) {
      if (!carpet) {
        return;
      }

      carpet.selectAll('.heatmap-crosshair').remove();

      var posX = position;
      posX = Math.max(posX, yAxisWidth);
      posX = Math.min(posX, chartWidth + yAxisWidth);

      carpet.append('g').attr('class', 'heatmap-crosshair').attr('transform', 'translate(' + posX + ',0)').append('line').attr('x1', 1).attr('y1', chartTop).attr('x2', 1).attr('y2', chartBottom).attr('stroke-width', 1);
    }

    function clearCrosshair() {
      if (!carpet) {
        return;
      }

      carpet.selectAll('.heatmap-crosshair').remove();
    }

    function limitSelection(x2) {
      x2 = Math.max(x2, yAxisWidth);
      x2 = Math.min(x2, chartWidth + yAxisWidth);
      return x2;
    }

    function drawSelection(posX1, posX2) {
      if (!carpet) {
        return;
      }

      carpet.selectAll('.carpet-selection').remove();
      var selectionX = Math.min(posX1, posX2);
      var selectionWidth = Math.abs(posX1 - posX2);

      if (selectionWidth > MIN_SELECTION_WIDTH) {
        carpet.append('rect').attr('class', 'carpet-selection').attr('x', selectionX).attr('width', selectionWidth).attr('y', chartTop).attr('height', chartHeight);
      }
    }

    function clearSelection() {
      selection.x1 = -1;
      selection.x2 = -1;

      if (!carpet) {
        return;
      }

      carpet.selectAll('.carpet-selection').remove();
    }

    function drawColorLegend() {
      d3.select("#heatmap-color-legend").selectAll("rect").remove();

      var legend = d3.select("#heatmap-color-legend");
      var legendWidth = Math.floor($(d3.select("#heatmap-color-legend").node()).outerWidth());
      var legendHeight = d3.select("#heatmap-color-legend").attr("height");

      drawLegend(legend, legendWidth, legendHeight);
    }

    function addLegend() {
      if (!panel.legend.show) {
        return;
      }

      var legendContainer = carpet.append('g').attr('class', 'carpet-legend').attr('transform', 'translate(' + yAxisWidth + ',' + (margin.top + chartHeight + xAxisHeight + LEGEND_TOP_MARGIN) + ')');

      var legendHeight = LEGEND_HEIGHT / 2;
      var labelMargin = 5;

      var minLabel = createMinMaxLabel(legendContainer, min);
      var maxLabel = createMinMaxLabel(legendContainer, max);
      var $minLabel = $(minLabel.node());
      var $maxLabel = $(maxLabel.node());

      var labelHeight = Math.ceil(Math.max($minLabel.height(), $maxLabel.height()));
      var labelWidth = Math.ceil(Math.max($minLabel.width(), $maxLabel.width()));
      var legendMargin = labelWidth + 2 * labelMargin;
      var labelY = (legendHeight - labelHeight + 8) / 2;

      minLabel.attr('x', legendMargin / 2).attr('y', labelY);
      maxLabel.attr('x', chartWidth - legendMargin / 2).attr('y', labelY);

      var legend = legendContainer.append('g').attr('transform', 'translate(' + legendMargin + ',0)');

      var legendWidth = chartWidth - 2 * legendMargin;
      drawLegend(legend, legendWidth, legendHeight);

      var legendScale = d3.scaleLinear().domain([min, max]).range([0, legendWidth]);

      var legendAxis = d3.axisBottom(legendScale).ticks(20).tickSize(legendHeight);

      legendContainer.append('g').attr('class', 'legend-axis').call(legendAxis).attr('transform', 'translate(' + legendMargin + ',0)').select('.domain').remove();
    }

    function createMinMaxLabel(legendContainer, text) {
      return legendContainer.append('text').attr('class', 'min-max-label').attr('y', 0).attr('x', 0).attr('dy', '0.71em').attr('text-anchor', 'middle').text(text);
    }

    function drawLegend(legend, legendWidth, legendHeight) {
      var rangeStep = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2;

      var legendColorScale = getColorScale(0, legendWidth);
      var valuesRange = d3.range(0, legendWidth, rangeStep);

      return legend.selectAll(".heatmap-color-legend-rect").data(valuesRange).enter().append("rect").attr("x", function (d) {
        return d;
      }).attr("y", 0).attr("width", rangeStep + 1 // Overlap rectangles to prevent gaps
      ).attr("height", legendHeight).attr("stroke-width", 0).attr("fill", function (d) {
        return legendColorScale(d);
      });
    }

    // Render

    function render() {
      data = ctrl.data;
      panel = ctrl.panel;
      timeRange = ctrl.range;

      fragment = getFragment(panel.fragment);

      if (!d3.select("#heatmap-color-legend").empty()) {
        drawColorLegend();
      }

      addCarpetplot();

      scope.yAxisWidth = yAxisWidth;
      scope.xAxisHeight = xAxisHeight;
      scope.chartHeight = chartHeight;
      scope.chartWidth = chartWidth;
      scope.chartTop = chartTop;
      scope.fragment = fragment;
      scope.xFrom = xFrom;
    }

    $carpet.on('mousedown', onMouseDown);
    $carpet.on('mousemove', onMouseMove);
    $carpet.on('mouseleave', onMouseLeave);
  }

  _export('default', link);

  return {
    setters: [function (_d2) {
      d3 = _d2.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreCore) {
      appEvents = _appCoreCore.appEvents;
      contextSrv = _appCoreCore.contextSrv;
    }, function (_appCoreUtilsTicks) {
      tickStep = _appCoreUtilsTicks.tickStep;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_fragments) {
      getFragment = _fragments.getFragment;
    }, function (_tooltip) {
      CarpetplotTooltip = _tooltip.default;
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
      X_AXIS_TICK_MIN_SIZE = 100;
      Y_AXIS_TICK_PADDING = 5;
      Y_AXIS_TICK_MIN_SIZE = 20;
      MIN_SELECTION_WIDTH = 2;
      LEGEND_HEIGHT = 40;
      LEGEND_TOP_MARGIN = 10;
    }
  };
});
//# sourceMappingURL=rendering.js.map
