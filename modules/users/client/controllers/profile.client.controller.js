'use strict';

angular.module('users').controller('UserProfileController', ['$scope', 'Authentication', 'Users', 'Pronouns', 'profileResolve', 'followersResolve',
  function ($scope, Authentication, Users, Pronouns, profileResolve, followersResolve) {
    $scope.authentication = Authentication;
    $scope.profile = profileResolve;
    $scope.limits = {
      friends: 5,
      followers: 5,
      following: 5
    };
    $scope.profile.$promise.then(function() {
      $scope.profile.followers = followersResolve;
      $scope.createFriendList();
    });

    $scope.createFriendList = function() {
      $scope.profile.friends = [];
      for (var i = $scope.profile.following.length - 1; i >= 0; i--) {
        for(var j = $scope.profile.followers.length - 1; j >= 0; j--){
          if($scope.profile.following[i]._id === $scope.profile.followers[j]._id){
            $scope.profile.friends.push($scope.profile.following[i]);
            $scope.profile.followers.splice(j, 1);
            $scope.profile.following.splice(i, 1);
          }
        }
      }
    };

    $scope.user = Authentication.user;

    $scope.addFollowing = function () {
      if($scope.profile._id !== $scope.user._id) {
        var user = new Users($scope.user);
        user.following.push($scope.profile._id);

        user.$update(function (response) {
          Authentication.user = response;
          $scope.user = response;
          $scope.profile.followers.push($scope.user);
          $scope.createFriendList();
        }, function (response) {
          $scope.error = response.data.message;
        });
      }
    };
    $scope.removeFollowing = function () {
      if($scope.profile._id !== $scope.user._id) {
        var user = new Users($scope.user);
        user.following.splice(user.following.indexOf($scope.profile._id), 1);

        user.$update(function (response) {
          Authentication.user = response;
          $scope.user = response;
          for(var i = $scope.profile.followers.length - 1; i >= 0; i--){
            if($scope.profile.followers[i]._id === $scope.user._id){
              $scope.profile.followers.splice(i, 1);
            }
          }
          for(var j = $scope.profile.friends.length - 1; j >= 0; j--){
            if($scope.profile.friends[j]._id === $scope.user._id){
              $scope.profile.friends.splice(j, 1);
              $scope.profile.following.push($scope.user);
            }
          }
        }, function (response) {
          $scope.error = response.data.message;
        });
      }
    };
    $scope.loadMore = function(thing) {
      $scope.limits[thing] = $scope.profile[thing].length + 5; //Just to be safe :P
    };
  }
]);
