'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
angular.module('users').factory('Profile', ['$resource',
  function ($resource) {
    return $resource('api/users/profile/get/:id/:username', {
      username: '@username',
      id: '@id'
    }, {
      'byUsername': {
        method: 'GET',
        url: 'api/users/profile/username/:username'
      },
      'byId': {
        method: 'GET',
        url: 'api/users/profile/id/:id'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

