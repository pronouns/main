'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Users', 'Profile',
  function ($scope, Authentication, Users, Profile) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;

    $scope.friends = [];
    if($scope.user) {
      $scope.user.friends.forEach(function (value) {
        Profile.get({ username: value }, function (data) {
          $scope.friends.push(data);
        });
      });
    }
  }
]);
