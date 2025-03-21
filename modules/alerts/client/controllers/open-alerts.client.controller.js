(function () {
  'use strict';

  angular
    .module('alerts')
    .controller('OpenAlertsController', AlertsListController);

  AlertsListController.$inject = ['AlertsService', '$window'];

  function AlertsListController(AlertsService, $window) {

    $window.document.title = 'Alerts';

    var vm = this;

    vm.alerts = AlertsService.open();
  }
})();

