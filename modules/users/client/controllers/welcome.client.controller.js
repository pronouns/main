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
    $scope.hasSavedData = function (id) {
      switch (id){
        case 'pronouns':
          return $scope.user.pronouns.length > 0;
        case 'names':
          return $scope.user.names.length > 0;
        case 'nouns':
          return $scope.user.nouns.nounType !== undefined || $scope.user.nouns.goodWords.length > 0 || $scope.user.nouns.badWords.length > 0 || ($scope.user.nouns.otherInfo !== undefined && $scope.user.nouns.otherInfo !== '');
        case 'relations':
          return $scope.user.following.length > 0;
        case 'alerts':
          return $scope.user.alertChannels.length > 0;
        default:
          return false;
      }
    };
    $scope.wasClicked = function (id) {
      return ($scope.clicks[id] === true || $scope.hasSavedData(id)) ? 'active' : '';
    };
    $scope.wasAllClicked = function (id) {
      return $scope.wasClicked('pronouns') && $scope.wasClicked('names') && $scope.wasClicked('nouns') && $scope.wasClicked('relations') && $scope.wasClicked('alerts');
    };
  }
]);
