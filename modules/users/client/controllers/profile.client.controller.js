'use strict';

angular.module('users').controller('UserProfileController', ['$scope', 'Authentication', 'Users', 'Pronouns', 'profileResolve',
  function ($scope, Authentication, Users, Pronouns, profileResolve) {
    $scope.authentication = Authentication;
    $scope.profile = profileResolve;

    $scope.user = Authentication.user;

    $scope.addFollowing = function () {
      if($scope.profile._id !== $scope.user._id) {
        var user = new Users($scope.user);
        user.following.push($scope.profile._id);
        console.log(user);

        user.$update(function (response) {
          Authentication.user = response;
          $scope.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      }
    };
    $scope.removeFollowing = function () {
      if($scope.profile._id !== $scope.user._id) {
        var user = new Users($scope.user);
        user.following.splice(user.following.indexOf($scope.profile._id), 1);
        console.log(user);

        user.$update(function (response) {
          Authentication.user = response;
          $scope.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      }
    };
  }
]);
