'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/core', './data-converter', './aggregates', './fragments', './rendering', './css/carpet-plot.css!'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, contextSrv, createConverter, aggregates, fragments, rendering, _createClass, panelDefaults, colorSchemes, CarpetPlotCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreCore) {
      contextSrv = _appCoreCore.contextSrv;
    }, function (_dataConverter) {
      createConverter = _dataConverter.default;
    }, function (_aggregates) {
      aggregates = _aggregates.default;
    }, function (_fragments) {
      fragments = _fragments.default;
    }, function (_rendering) {
      rendering = _rendering.default;
    }, function (_cssCarpetPlotCss) {}],
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

      panelDefaults = {
        aggregate: aggregates.AVG,
        fragment: fragments.HOUR,
        color: {
          colorScheme: 'interpolateRdYlGn',
          nullColor: 'transparent'
        },
        scale: {
          min: null,
          max: null
        }
      };
      colorSchemes = [
      // Diverging
      { name: 'Spectral', value: 'interpolateSpectral', invert: 'always' }, { name: 'RdYlGn', value: 'interpolateRdYlGn', invert: 'always' },

      // Sequential (Single Hue)
      { name: 'Blues', value: 'interpolateBlues', invert: 'dark' }, { name: 'Greens', value: 'interpolateGreens', invert: 'dark' }, { name: 'Greys', value: 'interpolateGreys', invert: 'dark' }, { name: 'Oranges', value: 'interpolateOranges', invert: 'dark' }, { name: 'Purples', value: 'interpolatePurples', invert: 'dark' }, { name: 'Reds', value: 'interpolateReds', invert: 'dark' },

      // Sequential (Multi-Hue)
      { name: 'BuGn', value: 'interpolateBuGn', invert: 'dark' }, { name: 'BuPu', value: 'interpolateBuPu', invert: 'dark' }, { name: 'GnBu', value: 'interpolateGnBu', invert: 'dark' }, { name: 'OrRd', value: 'interpolateOrRd', invert: 'dark' }, { name: 'PuBuGn', value: 'interpolatePuBuGn', invert: 'dark' }, { name: 'PuBu', value: 'interpolatePuBu', invert: 'dark' }, { name: 'PuRd', value: 'interpolatePuRd', invert: 'dark' }, { name: 'RdPu', value: 'interpolateRdPu', invert: 'dark' }, { name: 'YlGnBu', value: 'interpolateYlGnBu', invert: 'dark' }, { name: 'YlGn', value: 'interpolateYlGn', invert: 'dark' }, { name: 'YlOrBr', value: 'interpolateYlOrBr', invert: 'dark' }, { name: 'YlOrRd', value: 'interpolateYlOrRd', invert: 'darm' }];

      _export('CarpetPlotCtrl', CarpetPlotCtrl = function (_MetricsPanelCtrl) {
        _inherits(CarpetPlotCtrl, _MetricsPanelCtrl);

        function CarpetPlotCtrl($scope, $injector, $rootScope, timeSrv) {
          _classCallCheck(this, CarpetPlotCtrl);

          var _this = _possibleConstructorReturn(this, (CarpetPlotCtrl.__proto__ || Object.getPrototypeOf(CarpetPlotCtrl)).call(this, $scope, $injector));

          _this.onDataReceived = function (dataList) {
            // TODO - dynamic params
            var converter = createConverter(_this.panel.aggregate, _this.panel.fragment);

            var _this$timeSrv$timeRan = _this.timeSrv.timeRange(),
                from = _this$timeSrv$timeRan.from,
                to = _this$timeSrv$timeRan.to;

            _this.data = converter.convertData(from, to, dataList);
            _this.render();
          };

          _this.data = {};
          _this.timeSrv = timeSrv;
          _this.colorSchemes = colorSchemes;
          _this.theme = contextSrv.user.lightTheme ? 'light' : 'dark';

          _.defaultsDeep(_this.panel, panelDefaults);

          _this.events.on('data-received', _this.onDataReceived);
          _this.events.on('data-snapshot-load', _this.onDataReceived);
          return _this;
        }

        _createClass(CarpetPlotCtrl, [{
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            rendering(scope, elem, attrs, ctrl);
          }
        }]);

        return CarpetPlotCtrl;
      }(MetricsPanelCtrl));

      _export('CarpetPlotCtrl', CarpetPlotCtrl);

      CarpetPlotCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=carpetplot-ctrl.js.map
