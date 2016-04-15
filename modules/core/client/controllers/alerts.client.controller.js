'use strict';

angular.module('core').controller('AlertsController', ['$scope',
  function ($scope) {
    $scope.alerts = [
      { type: 'warning', msg: 'Pronouny is running a new alerts module. You may experience issues with alert processing. You can report issues to hello@pronouny.xyz or on Github.' }
    ];
    $scope.closeAlert = function (index) {
      $scope.alerts.splice(index, 1);
    };
  }
]);
