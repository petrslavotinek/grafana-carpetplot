import d3 from 'd3';
import _ from 'lodash';
import { contextSrv } from 'app/core/core';
import { tickStep } from 'app/core/utils/ticks';

const
  DEFAULT_X_TICK_SIZE_PX = 100,
  X_AXIS_TICK_PADDING = 10,
  Y_AXIS_TICK_PADDING = 5,
  MIN_SELECTION_WIDTH = 2;

export default function link(scope, elem, attrs, ctrl) {
  let data, panel, timeRange, carpet;

  const $carpet = elem.find('.carpetplot-panel');

  // const padding = { left: 0, right: 0, top: 0, bottom: 0 };
  const margin = { left: 25, right: 15, top: 10, bottom: 20 };

  let width, height,
    min, max,
    chartHeight, chartWidth,
    chartTop, chartBottom,
    xAxisHeight, yAxisWidth,
    yScale, xScale,
    colorScale;

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
    const yMin = 24;
    const yMax = 0;
    const ticks = 6;
    const tickInterval = tickStep(yMin, yMax, ticks);

    data.yAxis = {
      min: yMin,
      max: yMax,
      ticks: ticks
    };

    scope.yScale = yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([chartHeight, 0]);

    const yAxis = d3.axisLeft(yScale)
      .ticks(ticks)
      .tickFormat((value) => `${value.toString().padStart(2, '0')}:00`)
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

  function addXAxis() {
    scope.xScale = xScale = d3.scaleTime()
      .domain([timeRange.from, timeRange.to])
      .range([0, chartWidth]);

    const ticks = chartWidth / DEFAULT_X_TICK_SIZE_PX;
    const grafanaTimeFormatter = grafanaTimeFormat(ticks, timeRange.from, timeRange.to);

    const xAxis = d3.axisBottom(xScale)
      .ticks(ticks)
      .tickFormat(d3.timeFormat(grafanaTimeFormatter))
      .tickPadding(X_AXIS_TICK_PADDING)
      .tickSize(chartHeight);

    const posY = margin.top;
    const posX = yAxisWidth;
    carpet.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${posX},${posY})`)
      .call(xAxis);

    carpet.select('.axis-x').select('.domain').remove();
  }

  function getYAxisWidth() {
    const axisText = carpet.selectAll('.axis-y text').nodes();
    return d3.max(axisText, (text) => $(text).outerWidth());
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

  function render() {
    data = ctrl.data;
    panel = ctrl.panel;
    timeRange = ctrl.range;

    console.log(data)

    addCarpetplot();
  }
}

function grafanaTimeFormat(ticks, min, max) {
  if (min && max && ticks) {
    const range = max - min;
    const secPerTick = (range / ticks) / 1000;
    const oneDay = 86400000;
    const oneYear = 31536000000;

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