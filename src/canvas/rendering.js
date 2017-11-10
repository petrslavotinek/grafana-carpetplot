import d3 from 'd3';
import _ from 'lodash';
import { appEvents, contextSrv } from 'app/core/core';
import { tickStep } from 'app/core/utils/ticks';
import moment from 'moment';
import $ from 'jquery';

import { getFragment } from '../fragments';
import CarpetplotTooltip from './tooltip';
import { valueFormatter } from '../formatting';
import { labelFormats } from '../xAxisLabelFormats';

const
  DEFAULT_X_TICK_SIZE_PX = 100,
  X_AXIS_TICK_MIN_SIZE = 100,
  Y_AXIS_TICK_PADDING = 5,
  Y_AXIS_TICK_MIN_SIZE = 20,
  MIN_SELECTION_WIDTH = 2,
  LEGEND_HEIGHT = 40,
  LEGEND_TOP_MARGIN = 10;

export default function link(scope, elem, attrs, ctrl) {
  let data, panel, timeRange, carpet, canvas, context;

  const $carpet = elem.find('.carpetplot-panel');
  const tooltip = new CarpetplotTooltip($carpet, scope);

  const margin = { left: 25, right: 15, top: 10, bottom: 10 };

  let width, height,
    min, max,
    xFrom, xTo, days,
    chartHeight, chartWidth,
    chartTop, chartBottom,
    xAxisHeight, yAxisWidth,
    yScale, xScale,
    legendHeight,
    colorScale, fragment,
    mouseUpHandler,
    originalPointColor,
    pointWidth, pointHeight,
    highlightedBucket,
    $canvas;

  const selection = {
    active: false,
    x1: -1,
    x2: -1
  };

  ctrl.events.on('render', () => {
    render();
    ctrl.renderingCompleted();
  });

  function addCarpetplot() {
    if (!data.data || !data.data[0]) { return; }

    [min, max] = getMinMax();
    colorScale = getColorScale(min, max);

    addCarpetplotSvg();
    addAxes();
    addLegend();
    addCanvas();
    addPoints();
  }

  function addCarpetplotSvg() {
    width = Math.floor($carpet.width());
    height = ctrl.height;

    if (carpet) {
      carpet.remove();
    }

    carpet = d3.select($carpet[0])
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  }

  function addAxes() {
    legendHeight = panel.legend.show ? LEGEND_HEIGHT + LEGEND_TOP_MARGIN : 0;
    xAxisHeight = panel.xAxis.hideLabels ? 0 : getXAxisHeight();
    chartHeight = height - margin.top - margin.bottom - legendHeight - xAxisHeight;
    chartTop = margin.top;
    chartBottom = chartTop + chartHeight;

    addYAxis();
    yAxisWidth = panel.yAxis.hideLabels ? 0 : (getYAxisWidth() + Y_AXIS_TICK_PADDING);
    chartWidth = width - yAxisWidth - margin.right;

    addXAxis();
    // xAxisHeight = getXAxisHeight();

    if (!panel.yAxis.show) {
      carpet.select('.axis-y').selectAll('line').style('opacity', 0);
    }

    if (!panel.xAxis.show) {
      carpet.select('.axis-x').selectAll('line').style('opacity', 0);
      carpet.selectAll('.axis-x-weekends').selectAll('line').style('opacity', 0);
    }
  }

  function addYAxis() {
    yScale = d3.scaleTime()
      .domain([moment().startOf('day').add(1, 'day'), moment().startOf('day')])
      .range([chartHeight, 0]);

    const yAxis = d3.axisLeft(yScale)
      .ticks(getYAxisTicks())
      .tickFormat((value) => moment(value).format('HH:mm'))
      .tickSizeInner(0 - width)
      .tickSizeOuter(0)
      .tickPadding(Y_AXIS_TICK_PADDING);

    if (!panel.yAxis.hideLabels) {
      carpet.append('g')
        .attr('class', 'axis axis-y')
        .call(yAxis);

      const posY = margin.top;
      const posX = getYAxisWidth() + Y_AXIS_TICK_PADDING;

      const yAxisGroup = carpet.select('.axis-y');
      yAxisGroup.attr('transform', `translate(${posX},${posY})`);
      yAxisGroup.select('.domain').remove();
      yAxisGroup.select('.tick:first-child').remove();
      yAxisGroup.selectAll('.tick line').remove();
    }
  }

  function getYAxisWidth() {
    const axisText = carpet.selectAll('.axis-y text').nodes();
    return d3.max(axisText, (text) => $(text).outerWidth());
  }

  function getYAxisTicks() {
    const count = chartHeight / Y_AXIS_TICK_MIN_SIZE;
    const step = Math.max(2, Math.ceil(24 / count));
    return d3.timeHour.every(step);
  }

  function addXAxis() {
    xFrom = moment(data.data[0].time).startOf('day');
    xTo = moment(data.data[data.data.length - 1].time).startOf('day').add(1, 'day');
    days = xTo.diff(xFrom, 'days');

    xScale = d3.scaleTime()
      .domain([xFrom, xTo])
      .range([0, chartWidth]);

    const xAxis = d3.axisBottom(xScale)
      .ticks(getXAxisTicks(xFrom, xTo))
      .tickFormat(d3.timeFormat(panel.xAxis.labelFormat))
      .tickSize(chartHeight);

    const dayWidth = chartWidth / days;

    const posY = margin.top;
    const posX = yAxisWidth;

    if (!panel.xAxis.hideLabels) {
      carpet.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', `translate(${posX},${posY})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('y', 0)
        .attr('transform', `translate(${5 + dayWidth / 2},${posY + chartHeight - 10}) rotate(-65)`);
      carpet.select('.axis-x').selectAll('.tick line, .domain').remove();
      carpet.select('.axis-x').select('.tick:last-child').remove();
    }

    if (panel.xAxis.showWeekends && dayWidth >= panel.xAxis.minBucketWidthToShowWeekends) {
      addDayTicks(posX, posY, d3.timeSaturday.every(1));
      addDayTicks(posX, posY, d3.timeMonday.every(1));
    }
  }

  function addDayTicks(posX, posY, range) {
    const ticks = d3.axisBottom(xScale)
      .ticks(range)
      .tickSize(chartHeight);
    carpet.append('g')
      .attr('class', 'axis-x-weekends')
      .attr('transform', `translate(${posX},${posY})`)
      .call(ticks)
      .selectAll('text').remove();
    carpet.select('.axis-x-weekends .domain').remove();
  }

  function getXAxisHeight() {
    return labelFormats.find(({ value }) => value === panel.xAxis.labelFormat).height;
    // const axis = carpet.select('.axis-x');
    // if (!axis.empty()) {
    //   const totalHeight = $(axis.node()).height();
    //   return Math.max(totalHeight, totalHeight - chartHeight);
    // }
    // return 0;
  }

  function getXAxisTicks(from, to) {
    const count = chartWidth / X_AXIS_TICK_MIN_SIZE;
    const step = Math.ceil(days / count);
    if (step < 7) {
      return d3.timeDay.every(1);
    }
    if (step < 28) {
      return d3.timeMonday.every(1);
    }
    return d3.timeMonth.every(1);
  }

  function addCanvas() {
    if (canvas) {
      canvas.remove();
    }

    canvas = d3.select($carpet[0])
      .insert('canvas', ':first-child')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .style('left', `${yAxisWidth}px`)
      .style('top', `${margin.top}px`);

    $canvas = $(canvas.node());

    context = canvas.node().getContext('2d');
  }

  function addPoints() {
    const customBase = document.createElement('custom');

    const container = d3.select(customBase);

    pointWidth = Math.max(0, chartWidth / days);
    pointHeight = Math.max(0, chartHeight / fragment.count);

    const pointScale = d3.scaleLinear()
      .domain([fragment.count, 0])
      .range([chartHeight, 0]);

    const cols = container
      .selectAll('custom.carpet-col')
      .data(data.data)
      .enter()
      .append('custom')
      .attr('class', 'carpet-col');

    const points = cols
      .selectAll('custom.carpet-point')
      .data((d, i) => d.buckets.map(value => ({
        value,
        time: d.time
      })))
      .enter()
      .append('custom')
      .attr('class', 'carpet-point')
      .attr('fillStyle', ({ value }) => value === null ? panel.color.nullColor : colorScale(value))
      .attr('x', (d) => xScale(d.time.toDate()))
      .attr('y', (d, i) => pointScale(i));

    drawPoints(cols);
  }

  function drawPoints(cols) {
    context.clearRect(0, 0, chartWidth, chartHeight);

    const elements = cols.selectAll('custom.carpet-point')
      .each(function (d, i) {
        const node = d3.select(this);

        context.fillStyle = node.attr('fillStyle');
        context.fillRect(node.attr('x'), node.attr('y'), pointWidth, pointHeight);
      });
  }

  function getMinMax() {
    const { min, max } = panel.scale;
    return [
      isSet(min) ? min : data.stats.min,
      isSet(max) ? max : data.stats.max
    ];
  }

  function getColorScale(min, max) {
    const colorScheme = _.find(ctrl.colorSchemes, { value: panel.color.colorScheme });
    const colorInterpolator = d3[colorScheme.value];
    let colorScaleInverted = colorScheme.invert === 'always' || (colorScheme.invert === 'dark' && !contextSrv.user.lightTheme);
    colorScaleInverted = panel.color.invert ? !colorScaleInverted : colorScaleInverted;

    const start = colorScaleInverted ? max : min;
    const end = colorScaleInverted ? min : max;

    return d3
      .scaleSequential(colorInterpolator)
      .domain([start, end]);
  }

  function isSet(prop) {
    return prop !== undefined && prop !== null && prop !== '';
  }

  function onMouseDown(event) {
    const pos = getMousePos(event);
    if (!isInChart(pos)) { return; }

    selection.active = true;
    selection.x1 = pos.x;

    mouseUpHandler = () => onMouseUp();

    $(document).one('mouseup', mouseUpHandler);
  }

  function onMouseUp() {
    $(document).unbind('mouseup', mouseUpHandler);
    mouseUpHandler = null;
    selection.active = false;

    const selectionRange = Math.abs(selection.x2 - selection.x1);

    if (selection.x2 >= 0 && selectionRange > MIN_SELECTION_WIDTH) {
      const timeFrom = moment(xScale.invert(Math.min(selection.x1, selection.x2))).startOf('day');
      const timeTo = moment(xScale.invert(Math.max(selection.x1, selection.x2))).startOf('day').add(1, 'day');

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
    if (!carpet) { return; }

    const pos = getMousePos(event);

    if (selection.active) {
      clearCrosshair();
      tooltip.destroy();

      selection.x2 = pos.x;
      drawSelection(selection.x1, selection.x2);
    } else {
      drawCrosshair(pos);

      const bucket = getBucket(pos);
      tooltip.show(pos, bucket);
      highlightPoint(pos, bucket);
    }
  }

  function highlightPoint(pos, bucket) {
    if (!isInChart(pos) || !bucket || !bucket.hasValue()) {
      resetPointHighLight();
      return;
    }

    if (bucket.equals(highlightedBucket)) {
      return;
    } else {
      resetPointHighLight();
    }

    highlightedBucket = bucket;

    const { value, x, y } = bucket;

    const color = colorScale(value);
    const highlightColor = d3.color(color).darker(1);
    originalPointColor = color;

    context.fillStyle = highlightColor;
    context.fillRect(x, y, pointWidth, pointHeight);
  }

  function resetPointHighLight() {
    if (!highlightedBucket) { return; }

    const { x, y } = highlightedBucket;
    context.fillStyle = originalPointColor;
    context.fillRect(x, y, pointWidth, pointHeight);

    highlightedBucket = null;
  }

  function getMousePos(event) {
    const { left, top } = $canvas[0].getBoundingClientRect();
    const { pageX, pageY } = event;
    const pos = {
      x: pageX - window.pageXOffset - left,
      y: pageY - window.pageYOffset - top,
      pageX,
      pageY
    };
    return pos;
  }

  function drawCrosshair(pos) {
    if (!carpet || !isInChart(pos)) {
      clearCrosshair();
      return;
    }

    carpet.selectAll('.heatmap-crosshair').remove();

    const x = pos.x + yAxisWidth;
    const y = pos.y + chartTop;

    const crosshair = carpet.append('g')
      .attr('class', 'heatmap-crosshair');

    if (panel.xAxis.showCrosshair) {
      crosshair.append('line')
        .attr('x1', x)
        .attr('y1', chartTop)
        .attr('x2', x)
        .attr('y2', chartBottom)
        .attr('stroke-width', 1);
    }

    if (panel.yAxis.showCrosshair) {
      crosshair.append('line')
        .attr('x1', yAxisWidth)
        .attr('y1', y)
        .attr('x2', yAxisWidth + chartWidth)
        .attr('y2', y)
        .attr('stroke-width', 1);
    }
  }

  function clearCrosshair() {
    if (!carpet) { return; }

    carpet.selectAll('.heatmap-crosshair').remove();
  }

  function drawSelection(posX1, posX2) {
    if (!carpet) { return; }

    carpet.selectAll('.carpet-selection').remove();
    const selectionX = Math.min(posX1, posX2) + yAxisWidth;
    const selectionWidth = Math.abs(posX1 - posX2);

    if (selectionWidth > MIN_SELECTION_WIDTH) {
      carpet.append('rect')
        .attr('class', 'carpet-selection')
        .attr('x', selectionX)
        .attr('width', selectionWidth)
        .attr('y', chartTop)
        .attr('height', chartHeight);
    }
  }

  function clearSelection() {
    selection.x1 = -1;
    selection.x2 = -1;

    if (!carpet) { return; }

    carpet.selectAll('.carpet-selection').remove();
  }

  function drawColorLegend() {
    d3.select("#heatmap-color-legend").selectAll("rect").remove();

    const legend = d3.select("#heatmap-color-legend");
    const legendWidth = Math.floor($(d3.select("#heatmap-color-legend").node()).outerWidth());
    const legendHeight = d3.select("#heatmap-color-legend").attr("height");

    drawLegend(legend, legendWidth, legendHeight);
  }

  function addLegend() {
    if (!panel.legend.show) { return; }

    const decimals = panel.data.decimals;
    const format = panel.data.unitFormat;
    const formatter = valueFormatter(format, decimals);

    const legendY = yAxisWidth;
    const legendX = margin.top + chartHeight + xAxisHeight + LEGEND_TOP_MARGIN;

    const legendContainer = carpet.append('g')
      .attr('class', 'carpet-legend')
      .attr('transform', `translate(${legendY},${legendX})`);

    const legendHeight = LEGEND_HEIGHT / 2;
    const labelMargin = 5;

    const minLabel = createMinMaxLabel(legendContainer, formatter(min));
    const maxLabel = createMinMaxLabel(legendContainer, formatter(max));
    const $minLabel = $(minLabel.node());
    const $maxLabel = $(maxLabel.node());

    const labelHeight = Math.ceil(Math.max($minLabel.height(), $maxLabel.height()));
    const labelWidth = Math.ceil(Math.max($minLabel.width(), $maxLabel.width()));
    const legendMargin = labelWidth + 2 * labelMargin;
    const labelY = (legendHeight - labelHeight + 8) / 2;

    minLabel
      .attr('x', legendMargin / 2)
      .attr('y', labelY);
    maxLabel
      .attr('x', chartWidth - legendMargin / 2)
      .attr('y', labelY);

    const legend = legendContainer.append('g')
      .attr('transform', `translate(${legendMargin},0)`);

    const legendWidth = chartWidth - 2 * legendMargin;
    drawLegend(legend, legendWidth, legendHeight);

    const legendScale = d3.scaleLinear()
      .domain([min, max])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(20)
      .tickFormat(formatter)
      .tickSize(legendHeight);

    legendContainer.append('g')
      .attr('class', 'legend-axis')
      .call(legendAxis)
      .attr('transform', `translate(${legendMargin},0)`)
      .select('.domain').remove();
  }

  function createMinMaxLabel(legendContainer, text) {
    return legendContainer.append('text')
      .attr('class', 'min-max-label')
      .attr('y', 0)
      .attr('x', 0)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'middle')
      .text(text);
  }

  function drawLegend(legend, legendWidth, legendHeight, rangeStep = 2) {
    const legendColorScale = getColorScale(0, legendWidth);
    const valuesRange = d3.range(0, legendWidth, rangeStep);

    return legend.selectAll(".heatmap-color-legend-rect")
      .data(valuesRange)
      .enter()
      .append("rect")
      .attr("x", d => d)
      .attr("y", 0)
      .attr("width", rangeStep + 1) // Overlap rectangles to prevent gaps
      .attr("height", legendHeight)
      .attr("stroke-width", 0)
      .attr("fill", d => legendColorScale(d));
  }

  // Helpers

  function isInChart(pos) {
    const { x, y } = pos;

    return x > 0
      && x < chartWidth
      && y > 0
      && y < chartHeight;
  }

  function getBucket(pos) {
    const { x, y } = pos;

    const xTime = moment(xScale.invert(x)).startOf('day');
    const yTime = moment(yScale.invert(y));

    const dayIndex = xTime.diff(xFrom, 'days');
    const bucketIndex = fragment.getBucketIndex(yTime);

    const bucketX = xScale(xTime.toDate());
    const bucketY = pointHeight * bucketIndex;

    return _.has(data, `data[${dayIndex}].buckets[${bucketIndex}]`)
      ? {
        x: bucketX,
        y: bucketY,
        time: fragment.getTime(data.data[dayIndex].time, bucketIndex),
        value: data.data[dayIndex].buckets[bucketIndex],
        hasValue() {
          return this.value !== null;
        },
        equals(bucket) {
          return bucket && bucket.x === this.x && bucket.y === this.y;
        }
      }
      : null;
  }

  function hasData() {
    return data && data.data;
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

    scope.hasData = hasData;
    scope.isInChart = isInChart;
  }

  $carpet.on('mousedown', onMouseDown);
  $carpet.on('mousemove', onMouseMove);
  $carpet.on('mouseleave', onMouseLeave);
}