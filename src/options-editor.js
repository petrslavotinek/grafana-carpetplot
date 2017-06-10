export class CarpetplotOptionsEditorCtrl {
  constructor($scope) {
    $scope.editor = this;
    this.panelCtrl = $scope.ctrl;
    this.panel = this.panelCtrl.panel;

    this.panelCtrl.render();
  }
}

export function carpetplotOptionsEditor() {
  'use strict';
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'public/plugins/carpetplot/partials/options-editor.html',
    controller: CarpetplotOptionsEditorCtrl,
  };
}
