'use strict';

System.register(['app/core/utils/kbn'], function (_export, _context) {
  "use strict";

  var kbn, _createClass, CarpetplotOptionsEditorCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function carpetplotOptionsEditor() {
    'use strict';

    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'public/plugins/carpetplot/partials/options-editor.html',
      controller: CarpetplotOptionsEditorCtrl
    };
  }

  _export('carpetplotOptionsEditor', carpetplotOptionsEditor);

  return {
    setters: [function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
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

      _export('CarpetplotOptionsEditorCtrl', CarpetplotOptionsEditorCtrl = function () {
        function CarpetplotOptionsEditorCtrl($scope) {
          _classCallCheck(this, CarpetplotOptionsEditorCtrl);

          $scope.editor = this;
          this.panelCtrl = $scope.ctrl;
          this.panel = this.panelCtrl.panel;
          this.unitFormats = kbn.getUnitFormats();

          this.panelCtrl.render();
        }

        _createClass(CarpetplotOptionsEditorCtrl, [{
          key: 'setUnitFormat',
          value: function setUnitFormat(subItem) {
            this.panel.data.unitFormat = subItem.value;
            this.panelCtrl.render();
          }
        }]);

        return CarpetplotOptionsEditorCtrl;
      }());

      _export('CarpetplotOptionsEditorCtrl', CarpetplotOptionsEditorCtrl);
    }
  };
});
//# sourceMappingURL=options-editor.js.map
