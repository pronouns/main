(function () {
  'use strict';

  angular
    .module('alerts')
    .controller('AlertsListController', AlertsListController);

  AlertsListController.$inject = ['AlertsService', '$window'];

  function AlertsListController(AlertsService, $window) {

    $window.document.title = 'Sent Alerts';

    var vm = this;

    vm.alerts = AlertsService.query();
  }
})();
