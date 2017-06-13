import d3 from 'd3';
import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';

import { valueFormatter } from '../formatting';

let TOOLTIP_PADDING_X = 30;
let TOOLTIP_PADDING_Y = 5;

class CarpetplotTooltip {

  constructor(elem, scope) {
    this.tooltip = null;
    this.scope = scope;
    this.dashboard = scope.ctrl.dashboard;
    this.panel = scope.ctrl.panel;
    this.carpetPanel = elem;

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

  show(event, pos, data) {
    if (!this.panel.tooltip.show || !data) { return; }

    // shared tooltip mode
    if (event.panelRelY) {
      return;
    }

    if (!this.isInChart(pos) || !this.tooltip) {
      this.destroy();
      return;
    }

    const bucket = this.getBucket(pos, data);
    if (!bucket || bucket.value === null) {
      this.destroy();
      return;
    }

    const tooltipTimeFormat = 'ddd YYYY-MM-DD HH:mm:ss';
    const time = this.dashboard.formatDate(bucket.time, tooltipTimeFormat);
    const decimals = this.panel.data.decimals || 5;
    const format = this.panel.data.unitFormat;;
    const formatter = valueFormatter(format, decimals);
    const value = formatter(bucket.value);

    let tooltipHtml = `
      <div class='graph-tooltip-time'>${time}</div>
      <div>
      value: <b>${value}</b><br/>
      </div>
    `;

    this.tooltip.html(tooltipHtml);

    this.move(event);
  }

  isInChart(pos) {
    const { x, y } = pos;
    const { chartWidth, chartHeight } = this.scope;

    return x > 0
      && x < chartWidth
      && y > 0
      && y < chartHeight;
  }

  getBucket(pos, data) {
    const { x, y } = pos;
    const { fragment, xFrom } = this.scope;

    const xTime = this.scope.xScale.invert(x);
    const yTime = this.scope.yScale.invert(y);

    const dayIndex = moment(xTime).startOf('day').diff(xFrom, 'days');
    const bucketIndex = fragment.getBucketIndex(moment(yTime));

    return _.has(data, `data[${dayIndex}].buckets[${bucketIndex}]`)
      ? {
        time: fragment.getTime(data.data[dayIndex].time, bucketIndex),
        value: data.data[dayIndex].buckets[bucketIndex]
      }
      : null;
  }

  move(event) {
    if (!this.tooltip) { return; }

    const elem = $(this.tooltip.node())[0];
    const tooltipWidth = elem.clientWidth;
    const tooltipHeight = elem.clientHeight;

    let left = event.pageX + TOOLTIP_PADDING_X;
    let top = event.pageY + TOOLTIP_PADDING_Y;

    if (event.pageX + tooltipWidth + 40 > window.innerWidth) {
      left = event.pageX - tooltipWidth - TOOLTIP_PADDING_X;
    }

    if (event.pageY - window.pageYOffset + tooltipHeight + 20 > window.innerHeight) {
      top = event.pageY - tooltipHeight - TOOLTIP_PADDING_Y;
    }

    return this.tooltip
      .style('left', left + 'px')
      .style('top', top + 'px');
  }
}

export default CarpetplotTooltip;