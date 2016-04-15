(function () {
  'use strict';

  angular
    .module('alerts')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('alerts', {
        abstract: true,
        url: '/alerts',
        template: '<ui-view/>'
      })
      .state('alerts.list', {
        url: '',
        templateUrl: 'modules/alerts/client/views/list-alerts.client.view.html',
        controller: 'AlertsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Alerts List'
        }
      })
      .state('alerts.view', {
        url: '/:alertId',
        templateUrl: 'modules/alerts/client/views/view-alert.client.view.html',
        controller: 'AlertsController',
        controllerAs: 'vm',
        resolve: {
          alertResolve: getAlert
        },
        data:{
          pageTitle: 'Alert {{ alertResolve.name }}'
        }
      });
  }

  getAlert.$inject = ['$stateParams', 'AlertsService'];

  function getAlert($stateParams, AlertsService) {
    return AlertsService.get({
      alertId: $stateParams.alertId
    }).$promise;
  }

})();
