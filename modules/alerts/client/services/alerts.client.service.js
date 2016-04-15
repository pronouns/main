//Alerts service used to communicate Alerts REST endpoints
(function () {
  'use strict';

  angular
    .module('alerts')
    .factory('AlertsService', AlertsService);

  AlertsService.$inject = ['$resource'];

  function AlertsService($resource) {
    return $resource('api/alerts/:alertId', {
      alertId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
