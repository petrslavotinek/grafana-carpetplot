import d3 from 'd3';
import $ from 'jquery';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import moment from 'moment';

let TOOLTIP_PADDING_X = 30;
let TOOLTIP_PADDING_Y = 5;

class CarpetplotTooltip {

  constructor(elem, scope) {
    this.tooltip = null;
    this.scope = scope;
    this.dashboard = scope.ctrl.dashboard;
    this.panel = scope.ctrl.panel;
    this.carpetPanel = elem;
    this.mouseOverPoint = false;

    elem.on('mouseover', this.onMouseOver.bind(this));
    elem.on('mouseleave', this.onMouseLeave.bind(this));
  }

  onMouseOver(e) {
    if (!this.panel.tooltip.show || !this.scope.ctrl.data || !this.scope.ctrl.data.data) { return; }

    if (!this.tooltip) {
      this.add();
      this.move(e);
    }
  }

  onMouseLeave() {
    this.destroy();
  }

  onMouseMove(e) {
    if (!this.panel.tooltip.show) { return; }

    this.move(e);
  }

  add() {
    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'carpet-tooltip graph-tooltip grafana-tooltip');
  }

  destroy() {
    if (this.tooltip) {
      this.tooltip.remove();
    }

    this.tooltip = null;
  }

  show(pos, data) {
    if (!this.panel.tooltip.show || !data) { return; }
    // shared tooltip mode
    if (pos.panelRelY) {
      return;
    }

    if (!this.isInChart(pos) || !this.tooltip) {
      this.destroy();
      return;
    }

    const bucket = this.getBucket(pos, data);
    if (!bucket) {
      this.destroy();
      return;
    }

    const tooltipTimeFormat = 'YYYY-MM-DD HH:mm:ss';
    const time = this.dashboard.formatDate(bucket.time, tooltipTimeFormat);
    const decimals = this.panel.tooltip.decimals || 5;
    const valueFormatter = this.valueFormatter(decimals);
    const value = valueFormatter(bucket.value);

    let tooltipHtml = `
      <div class='graph-tooltip-time'>${time}</div>
      <div>
      value: <b>${value}</b><br/>
      </div>
    `;

    this.tooltip.html(tooltipHtml);

    this.move(pos);
  }

  isInChart(pos) {
    const { offsetX, offsetY } = pos;
    const { yAxisWidth, chartWidth, chartTop, chartHeight } = this.scope;

    return offsetX > yAxisWidth
      && offsetX < yAxisWidth + chartWidth
      && offsetY > chartTop
      && offsetY < chartTop + chartHeight;
  }

  getBucket(pos, data) {
    const { offsetX, offsetY } = pos;
    const { yAxisWidth, chartTop, fragment, xFrom } = this.scope;

    const xTime = this.scope.xScale.invert(offsetX - yAxisWidth);
    const yTime = this.scope.yScale.invert(offsetY - chartTop);

    const dayIndex = moment(xTime).startOf('day').diff(xFrom, 'days');
    const bucketIndex = fragment.getBucketIndex(moment(yTime));

    return _.has(data, `data[${dayIndex}].buckets[${bucketIndex}]`)
      ? {
        time: fragment.getTime(data.data[dayIndex].time, bucketIndex),
        value: data.data[dayIndex].buckets[bucketIndex]
      }
      : null;
  }

  move(pos) {
    if (!this.tooltip) { return; }

    const elem = $(this.tooltip.node())[0];
    const tooltipWidth = elem.clientWidth;
    const tooltipHeight = elem.clientHeight;

    let left = pos.pageX + TOOLTIP_PADDING_X;
    let top = pos.pageY + TOOLTIP_PADDING_Y;

    if (pos.pageX + tooltipWidth + 40 > window.innerWidth) {
      left = pos.pageX - tooltipWidth - TOOLTIP_PADDING_X;
    }

    if (pos.pageY - window.pageYOffset + tooltipHeight + 20 > window.innerHeight) {
      top = pos.pageY - tooltipHeight - TOOLTIP_PADDING_Y;
    }

    return this.tooltip
      .style('left', left + 'px')
      .style('top', top + 'px');
  }

  valueFormatter(decimals) {
    const format = this.panel.yAxis.format;
    return (value) => kbn.valueFormats[format](value, _.isInteger(value) ? 0 : decimals);
  }
}

export default CarpetplotTooltip;