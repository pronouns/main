(function () {
  'use strict';

  angular
    .module('alerts')
    .controller('OpenAlertsController', AlertsListController);

  AlertsListController.$inject = ['AlertsService'];

  function AlertsListController(AlertsService) {
    var vm = this;

    vm.alerts = AlertsService.open();
  }
})();

