'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('pronouns').factory('Pronouns', ['$resource',
  function ($resource) {
    return $resource('api/pronouns/:pronounId', {
      pronounId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

