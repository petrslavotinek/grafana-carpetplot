import { MetricsPanelCtrl } from 'app/plugins/sdk';
import _ from 'lodash';
import { contextSrv } from 'app/core/core';
import kbn from 'app/core/utils/kbn';

import createConverter from './data-converter';
import aggregates from './aggregates';
import fragments from './fragments';
import rendering from './rendering';
import { carpetplotOptionsEditor } from './options-editor';
import './css/carpet-plot.css!';

const panelDefaults = {
  aggregate: aggregates.AVG,
  fragment: fragments.HOUR,
  color: {
    colorScheme: 'interpolateRdYlGn',
    nullColor: 'transparent'
  },
  scale: {
    min: null,
    max: null
  },
  yAxis: {
    format: 'short'
  },
  tooltip: {
    show: true,
    decimals: null
  }
};

const colorSchemes = [
  // Diverging
  { name: 'Spectral', value: 'interpolateSpectral', invert: 'always' },
  { name: 'RdYlGn', value: 'interpolateRdYlGn', invert: 'always' },

  // Sequential (Single Hue)
  { name: 'Blues', value: 'interpolateBlues', invert: 'dark' },
  { name: 'Greens', value: 'interpolateGreens', invert: 'dark' },
  { name: 'Greys', value: 'interpolateGreys', invert: 'dark' },
  { name: 'Oranges', value: 'interpolateOranges', invert: 'dark' },
  { name: 'Purples', value: 'interpolatePurples', invert: 'dark' },
  { name: 'Reds', value: 'interpolateReds', invert: 'dark' },

  // Sequential (Multi-Hue)
  { name: 'BuGn', value: 'interpolateBuGn', invert: 'dark' },
  { name: 'BuPu', value: 'interpolateBuPu', invert: 'dark' },
  { name: 'GnBu', value: 'interpolateGnBu', invert: 'dark' },
  { name: 'OrRd', value: 'interpolateOrRd', invert: 'dark' },
  { name: 'PuBuGn', value: 'interpolatePuBuGn', invert: 'dark' },
  { name: 'PuBu', value: 'interpolatePuBu', invert: 'dark' },
  { name: 'PuRd', value: 'interpolatePuRd', invert: 'dark' },
  { name: 'RdPu', value: 'interpolateRdPu', invert: 'dark' },
  { name: 'YlGnBu', value: 'interpolateYlGnBu', invert: 'dark' },
  { name: 'YlGn', value: 'interpolateYlGn', invert: 'dark' },
  { name: 'YlOrBr', value: 'interpolateYlOrBr', invert: 'dark' },
  { name: 'YlOrRd', value: 'interpolateYlOrRd', invert: 'darm' }
];

const fragmentOptions = [
  { name: 'Minute', value: fragments.MINUTE },
  { name: '15 minutes', value: fragments.QUARTER },
  { name: 'Hour', value: fragments.HOUR }
];

const aggregateOptions = [
  { name: 'Average', value: aggregates.AVG },
  { name: 'Sum', value: aggregates.SUM },
  { name: 'Count', value: aggregates.CNT },
];

export class CarpetPlotCtrl extends MetricsPanelCtrl {
  static templateUrl = 'module.html';

  constructor($scope, $injector, $rootScope, timeSrv) {
    super($scope, $injector);

    this.dataList = null;
    this.data = {};
    this.timeSrv = timeSrv;
    this.colorSchemes = colorSchemes;
    this.fragmentOptions = fragmentOptions;
    this.aggregateOptions = aggregateOptions;
    this.theme = contextSrv.user.lightTheme ? 'light' : 'dark';

    _.defaultsDeep(this.panel, panelDefaults);

    this.events.on('data-received', this.onDataReceived);
    this.events.on('data-snapshot-load', this.onDataReceived);
    this.events.on('init-edit-mode', this.onInitEditMode);
    this.events.on('render', this.onRender);
  }

  onDataReceived = (dataList) => {
    this.dataList = dataList;
    this.data = this.transformData(dataList);
    this.render();
  }

  onInitEditMode = () => {
    this.addEditorTab('Options', carpetplotOptionsEditor, 2);
    this.unitFormats = kbn.getUnitFormats();
  }

  onRender = () => {
    if (!this.dataList) { return; }
    this.data = this.transformData(this.dataList);
  }

  transformData(data) {
    const converter = createConverter(this.panel.aggregate, this.panel.fragment);
    const { from, to } = this.timeSrv.timeRange();
    return converter.convertData(from, to, data);
  }

  link(scope, elem, attrs, ctrl) {
    rendering(scope, elem, attrs, ctrl);
  }
}