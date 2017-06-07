'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.names', {
        url: '/names',
        templateUrl: 'modules/users/client/views/settings/update-names.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('settings.alerts', {
        url: '/alerts',
        templateUrl: 'modules/users/client/views/settings/manage-alerts.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      })
      .state('profile', {
        url: '/u/:username',
        templateUrl: 'modules/users/client/views/user-profile.client.view.html',
        controller: 'UserProfileController',
        resolve: {
          profileResolve: ['$stateParams', 'Profile', function ($stateParams, Profile) {
            return Profile.byUsername({
              username: $stateParams.username
            });
          }],
          followersResolve: ['$stateParams', 'Followers', function ($stateParams, Followers) {
            return Followers.byUsername({
              username: $stateParams.username
            });
          }]
        }
      })
      // TODO remove
      .state('profileDEPRECATED', {
        url: '/users/:username',
        templateUrl: 'modules/users/client/views/user-profile.client.view.html',
        controller: 'UserProfileController',
        resolve: {
          profileResolve: ['$stateParams', 'Profile', function ($stateParams, Profile) {
            return Profile.byUsername({
              username: $stateParams.username
            });
          }],
          followersResolve: ['$stateParams', 'Followers', function ($stateParams, Followers) {
            return Followers.byUsername({
              username: $stateParams.username
            });
          }]
        }
      }).state('relations', {
        url: '/relations',
        templateUrl: 'modules/users/client/views/relations.client.view.html'
      }).state('names', {
        url: '/names',
        templateUrl: 'modules/users/client/views/update-names.client.view.html'
      }).state('nouns', {
        url: '/nouns',
        templateUrl: 'modules/users/client/views/nouns.client.view.html'
      }).state('welcome', {
        templateUrl: 'modules/users/client/views/welcome.client.view.html',
        params: {
          'destination': 'home',
          'params': []
        }
      });
  }
]);
