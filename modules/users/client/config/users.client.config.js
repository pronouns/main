'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);
angular.module('users').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Names',
      state: 'names',
      roles: ['user']
    });
    Menus.addMenuItem('topbar', {
      title: 'Nouns',
      state: 'nouns',
      roles: ['user']
    });
    Menus.addMenuItem('topbar', {
      title: 'Relations',
      state: 'relations',
      roles: ['user']
    });
  }
]);
