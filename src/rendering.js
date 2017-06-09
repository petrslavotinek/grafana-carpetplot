import d3 from 'd3';
import _ from 'lodash';
import { appEvents, contextSrv } from 'app/core/core';
import { tickStep } from 'app/core/utils/ticks';
import moment from 'moment';

import { getFragment } from './fragments';

const
  DEFAULT_X_TICK_SIZE_PX = 100,
  X_AXIS_TICK_MIN_SIZE = 100,
  Y_AXIS_TICK_PADDING = 5,
  MIN_SELECTION_WIDTH = 2;

export default function link(scope, elem, attrs, ctrl) {
  let data, panel, timeRange, carpet;

  const $carpet = elem.find('.carpetplot-panel');

  // const padding = { left: 0, right: 0, top: 0, bottom: 0 };
  const margin = { left: 25, right: 15, top: 10, bottom: 65 };

  let width, height,
    min, max,
    xFrom, xTo, days,
    chartHeight, chartWidth,
    chartTop, chartBottom,
    xAxisHeight, yAxisWidth,
    yScale, xScale,
    colorScale, fragment;

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
    if (!data.data) { return; }

    addCarpetplotCanvas();
    addAxes();

    [min, max] = getMinMax();
    colorScale = getColorScale(min, max);

    addPoints(colorScale);
  }

  function addCarpetplotCanvas() {
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
    scope.yScale = yScale = d3.scaleTime()
      .domain([moment().startOf('day').add(1, 'day'), moment().startOf('day')])
      .range([chartHeight, 0]);

    const yAxis = d3.axisLeft(yScale)
      .ticks(d3.timeHour.every(4))
      .tickFormat((value) => moment(value).format('HH:mm'))
      .tickSizeInner(0 - width)
      .tickSizeOuter(0)
      .tickPadding(Y_AXIS_TICK_PADDING);

    carpet.append('g')
      .attr('class', 'axis axis-y')
      .call(yAxis);

    const posY = margin.top;
    const posX = getYAxisWidth() + Y_AXIS_TICK_PADDING;

    const yAxisGroup = carpet.select('.axis-y');
    yAxisGroup.attr('transform', `translate(${posX},${posY})`);
    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('.tick line').remove();
  }

  function getYAxisWidth() {
    const axisText = carpet.selectAll('.axis-y text').nodes();
    return d3.max(axisText, (text) => $(text).outerWidth());
  }

  function addXAxis() {
    xFrom = moment(data.from.local()).startOf('day');
    xTo = moment(data.to.local()).startOf('day');
    days = xTo.diff(xFrom, 'days');

    scope.xScale = xScale = d3.scaleTime()
      .domain([xFrom, xTo])
      .range([0, chartWidth]);

    const xAxis = d3.axisBottom(xScale)
      .ticks(getXAxisTicks(xFrom, xTo))
      .tickFormat(d3.timeFormat('%a %m/%d'))
      .tickSize(chartHeight);

    const posY = margin.top;
    const posX = yAxisWidth;
    carpet.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${posX},${posY})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('y', 0)
      .attr('transform', `translate(5,${posY + chartHeight - 10}) rotate(-65)`);

    carpet.select('.axis-x').select('.domain').remove();
  }

  function getXAxisHeight() {
    const axisLine = carpet.select('.axis-x line');
    if (!axisLine.empty()) {
      const axisLinePosition = parseFloat(carpet.select('.axis-x line').attr('y2'));
      const canvasHeight = parseFloat(carpet.attr('height'));
      return canvasHeight - axisLinePosition;
    } else {
      // Default height
      return 30;
    }
  }

  function getXAxisTicks(from, to) {
    const count = chartWidth / X_AXIS_TICK_MIN_SIZE;
    const step = Math.ceil(days / count);
    if (step < 7) {
      return d3.timeDay.every(step);
    }
    if (step < 28) {
      return d3.timeWeek.every(Math.floor(step / 7));
    }
    return d3.timeMonth.every(1);
  }

  function addPoints(colorScale) {
    const container = carpet.insert('g', ':first-child')
      .attr('class', 'carpet-container')
      .attr('transform', `translate(${yAxisWidth},${margin.top})`);

    const cols = container
      .selectAll('.carpet-col')
      .data(data.data)
      .enter()
      .append('g')
      .attr('transform', (day) => `translate(${xScale(day.time.toDate())},0)`);

    const width = chartWidth / days;
    const height = chartHeight / fragment.count;
    const pointScale = d3.scaleLinear()
      .domain([24, 0])
      .range([chartHeight, 0])

    const points = cols
      .selectAll('.carpet-point')
      .data((d, i) => d.buckets)
      .enter()
      .append('rect')
      .attr('fill', value => value === null ? panel.color.nullColor : colorScale(value))
      .attr('x', 0)
      .attr('y', (d, i) => pointScale(i))
      .attr('width', width)
      .attr('height', height)
      .attr('title', (d, i) => `${i}: ${d}`);
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
    const colorScaleInverted = colorScheme.invert === 'always' || (colorScheme.invert === 'dark' && !contextSrv.user.lightTheme);

    const start = colorScaleInverted ? max : min;
    const end = colorScaleInverted ? min : max;

    return d3
      .scaleSequential(colorInterpolator)
      .domain([start, end]);
  }

  function isSet(prop) {
    return prop !== undefined && prop !== null && prop !== '';
  }

  // Selection, Crosshair, Tooltip
  // appEvents.on('graph-hover', event => {
  //   drawSharedCrosshair(event.pos);
  // }, scope);

  // appEvents.on('graph-hover-clear', () => {
  //   clearCrosshair();
  // }, scope);

  function onMouseDown(event) {
    // selection.active = true;
    // selection.x1 = event.offsetX;

    // mouseUpHandler = function () {
    //   onMouseUp();
    // };

    // $(document).one("mouseup", mouseUpHandler);
  }

  function onMouseUp() {
    // $(document).unbind("mouseup", mouseUpHandler);
    // mouseUpHandler = null;
    // selection.active = false;

    // let selectionRange = Math.abs(selection.x2 - selection.x1);
    // if (selection.x2 >= 0 && selectionRange > MIN_SELECTION_WIDTH) {
    //   let timeFrom = xScale.invert(Math.min(selection.x1, selection.x2) - yAxisWidth);
    //   let timeTo = xScale.invert(Math.max(selection.x1, selection.x2) - yAxisWidth);

    //   ctrl.timeSrv.setTime({
    //     from: moment.utc(timeFrom),
    //     to: moment.utc(timeTo)
    //   });
    // }

    // clearSelection();
  }

  function onMouseLeave() {
    // appEvents.emit('graph-hover-clear');
    clearCrosshair();
  }

  function onMouseMove(event) {
    if (!carpet) { return; }

    if (selection.active) {
      clearCrosshair();
      // tooltip.destroy();

      selection.x2 = limitSelection(event.offsetX);
      drawSelection(selection.x1, selection.x2);
    } else {
      drawCrosshair(event.offsetX);
      // tooltip.show(event, data);
    }
  }

  function drawCrosshair(position) {
    if (!carpet) { return; }

    carpet.selectAll(".heatmap-crosshair").remove();

    let posX = position;
    posX = Math.max(posX, yAxisWidth);
    posX = Math.min(posX, chartWidth + yAxisWidth);

    carpet.append("g")
      .attr("class", "heatmap-crosshair")
      .attr("transform", "translate(" + posX + ",0)")
      .append("line")
      .attr("x1", 1)
      .attr("y1", chartTop)
      .attr("x2", 1)
      .attr("y2", chartBottom)
      .attr("stroke-width", 1);

  }

  // function drawSharedCrosshair(pos) {
  //   if (!carpet || ctrl.dashboard.graphTooltip === 0) { return; }

  //   const posX = xScale(pos.x) + yAxisWidth;
  //   drawCrosshair(posX);
  // }

  function clearCrosshair() {
    if (!carpet) { return; }

    carpet.selectAll(".heatmap-crosshair").remove();
  }

  function limitSelection(x2) {
    x2 = Math.max(x2, yAxisWidth);
    x2 = Math.min(x2, chartWidth + yAxisWidth);
    return x2;
  }

  function drawSelection(posX1, posX2) {
    // TODO
  }

  // Render

  function render() {
    data = ctrl.data;
    panel = ctrl.panel;
    timeRange = ctrl.range;

    fragment = getFragment(panel.fragment);

    console.log(data)

    addCarpetplot();
  }

  $carpet.on("mousedown", onMouseDown);
  $carpet.on("mousemove", onMouseMove);
  $carpet.on("mouseleave", onMouseLeave);
}