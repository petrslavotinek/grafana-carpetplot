'use strict';

System.register([], function (_export, _context) {
  "use strict";

  var CarpetplotOptionsEditorCtrl;

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
    setters: [],
    execute: function () {
      _export('CarpetplotOptionsEditorCtrl', CarpetplotOptionsEditorCtrl = function CarpetplotOptionsEditorCtrl($scope) {
        _classCallCheck(this, CarpetplotOptionsEditorCtrl);

        $scope.editor = this;
        this.panelCtrl = $scope.ctrl;
        this.panel = this.panelCtrl.panel;

        this.panelCtrl.render();
      });

      _export('CarpetplotOptionsEditorCtrl', CarpetplotOptionsEditorCtrl);
    }
  };
});
//# sourceMappingURL=options-editor.js.map
