'use strict';

angular.module('users').controller('UpdatePronounsController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'Pronouns',
  function ($scope, $http, $location, Users, Authentication, Pronouns) {
    $scope.metaPronouns = ['Anything goes', 'No pronouns', 'Only neo-pronouns'];

    $scope.user = Authentication.user;
    $scope.pronouns = [];
    $scope.user.pronouns.forEach(function(value){
      Pronouns.get({ pronounId: value }, function(data) {
        $scope.pronouns.push(data);
      });
    });
    $scope.removeMine = function (pronoun) {
      var user = new Users($scope.user);
      user.pronouns.splice(user.pronouns.indexOf(pronoun._id), 1);

      user.$update(function (response) {
        Authentication.user = response;
        $scope.user = Authentication.user;
        $scope.pronouns = [];
        $scope.user.pronouns.forEach(function(value){
          Pronouns.get({ pronounId: value }, function(data) {
            $scope.pronouns.push(data);
          });
        });
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
    $scope.updateMetaPronoun = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

