(function () {
  'use strict';

  angular
    .module('alerts')
    .controller('AlertsListController', AlertsListController);

  AlertsListController.$inject = ['AlertsService'];

  function AlertsListController(AlertsService) {
    var vm = this;

    vm.alerts = AlertsService.query();
  }
})();
