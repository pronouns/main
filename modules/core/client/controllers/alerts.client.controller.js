'use strict';

angular.module('core').controller('AlertsController', ['$scope',
  function ($scope) {
    $scope.alerts = [
      { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
      { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
    ];
    $scope.closeAlert = function (index) {
      $scope.alerts.splice(index, 1);
    };
  }
]);
