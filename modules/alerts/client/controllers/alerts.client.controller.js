(function () {
  'use strict';

  // Alerts controller
  angular
    .module('alerts')
    .controller('AlertsController', AlertsController);

  AlertsController.$inject = ['$scope', '$state', 'Authentication', 'alertResolve'];

  function AlertsController ($scope, $state, Authentication, alert) {
    var vm = this;

    vm.authentication = Authentication;
    vm.alert = alert;
    vm.error = null;
    vm.remove = remove;

    // Remove existing Alert
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.alert.$remove($state.go('alerts.list'));
      }
    }
  }
})();
