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
angular.module('users').factory('Followers', ['$resource',
  function ($resource) {
    return $resource('api/users/followers/get/:id/:username', {
      username: '@username',
      id: '@id'
    }, {
      'byUsername': {
        method: 'GET',
        url: 'api/users/followers/username/:username',
        isArray: true
      },
      'byId': {
        method: 'GET',
        url: 'api/users/followers/id/:id',
        isArray: true
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

