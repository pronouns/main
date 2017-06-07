'use strict';

angular.module('users').controller('WelcomeController', ['$scope', '$state', '$http', 'Authentication', 'Users', 'Profile',
  function ($scope, $state, $http, Authentication, Users, Profile) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;
    $scope.clicks = [];


    $scope.navigateAway = function () {
      $state.go($state.params.destination, $state.params.params);
    };

    $scope.registerClick = function (id) {
      $scope.clicks[id] = true;
    };
    $scope.wasClicked = function (id) {
      return $scope.clicks[id] === true ? 'active' : '';
    };
    $scope.wasAllClicked = function (id) {
      return $scope.clicks.pronouns && $scope.clicks.names && $scope.clicks.nouns && $scope.clicks.relations && $scope.clicks.alerts;
    };
  }
]);
