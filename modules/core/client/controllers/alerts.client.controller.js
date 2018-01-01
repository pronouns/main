'use strict';

angular.module('core').controller('ServiceAlertsController', ['$scope',
  function ($scope) {
    $scope.alerts = [
      { type: 'danger', msg: 'Pronouny is running on a partially upgraded core, errors are likely to occur.' }
    ];
    $scope.closeAlert = function (index) {
      $scope.alerts.splice(index, 1);
    };
  }
]);
