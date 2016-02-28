'use strict';

angular.module('users').controller('UserProfileController', ['$scope', 'Authentication', 'Users', 'Pronouns', 'profileResolve',
  function ($scope, Authentication, Users, Pronouns, profileResolve) {
    $scope.authentication = Authentication;
    $scope.profile = profileResolve;

    $scope.user = Authentication.user;
  }
]);
