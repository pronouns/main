'use strict';

angular.module('core').controller('ServiceAlertsController', ['$scope',
  function ($scope) {
    $scope.alerts = [];
    $scope.closeAlert = function (index) {
      $scope.alerts.splice(index, 1);
    };
  }
]);
