'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$window', 'Authentication',
  function ($scope, $window, Authentication) {
    $window.document.title = 'Settings';
    $scope.user = Authentication.user;
  }
]);
