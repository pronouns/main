'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }],
          ownedPronounsResolve: ['$stateParams', '$http', '$q', function ($stateParams, $http, $q) {
            var deferred = $q.defer();

            $http.get('/api/pronouns/user/' + $stateParams.userId, {}).then(function(response){
              deferred.resolve(response.data);
            }, function(response){
              deferred.resolve([]);
            });

            return deferred.promise;
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }],
          ownedPronounsResolve: ['$stateParams', '$http', '$q', function ($stateParams, $http, $q) {
            var deferred = $q.defer();

            $http.get('/api/pronouns/user/' + $stateParams.userId, {}).then(function(response){
              deferred.resolve(response.data);
            }, function(response){
              deferred.resolve([]);
            });

            return deferred.promise;
          }]
        }
      });
  }
]);
