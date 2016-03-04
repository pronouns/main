'use strict';

angular.module('users').controller('UserProfileController', ['$scope', 'Authentication', 'Users', 'Pronouns', 'profileResolve',
  function ($scope, Authentication, Users, Pronouns, profileResolve) {
    $scope.authentication = Authentication;
    $scope.profile = profileResolve;
    console.log($scope.profile);

    $scope.user = Authentication.user;

    $scope.addFriend = function () {
      if($scope.profile._id !== $scope.user._id) {
        var user = new Users($scope.user);
        user.friends.push($scope.profile._id);

        user.$update(function (response) {
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      }
    };
    $scope.removeFriend = function () {
      if($scope.profile._id !== $scope.user._id) {
        var user = new Users($scope.user);
        user.friends.splice(user.friends.indexOf($scope.profile._id), 1);

        user.$update(function (response) {
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      }
    };
  }
]);
