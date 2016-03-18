'use strict';

angular.module('users').controller('UserProfileController', ['$scope', 'Authentication', 'Users', 'Pronouns', '$q', 'profileResolve', 'followersResolve',
  function ($scope, Authentication, Users, Pronouns, $q, profileResolve, followersResolve) {
    $scope.authentication = Authentication;
    $scope.limits = {
      friends: 5,
      followers: 5,
      following: 5
    };
    $q.all([
      profileResolve.$promise,
      followersResolve.$promise
    ]).then(function(data){
      $scope.profile = data[0];
      $scope.profile.followers = data[1];
      $scope.createFriendList();
    });
    var intersect = function(a, b) {
      var t;
      if (b.length > a.length){
        t = b;
        b = a;
        a = t;
      }
      return a.filter(function (e) {
        for(var i = 0; i < b.length; i++){
          if(b[i]._id === e._id){
            return true;
          }
        }
        return false;
      });
    };
    var remove = function(array, remove) {
      return array.filter(function (e) {
        for(var i = 0; i < remove.length; i++){
          if(remove[i]._id === e._id){
            return false;
          }
        }
        return true;
      });
    };
    $scope.createFriendList = function() {
      $scope.profile.friends = intersect($scope.profile.following, $scope.profile.followers);

      $scope.profile.followers = remove($scope.profile.followers, $scope.profile.friends);

      $scope.profile.following = remove($scope.profile.following, $scope.profile.friends);
    };

    $scope.user = Authentication.user;

    $scope.addFollowing = function () {
      if($scope.profile._id !== $scope.user._id) {
        var user = new Users($scope.user);
        user.following.push($scope.profile._id);

        user.$update(function (response) {
          Authentication.user = response;
          $scope.user = response;
          for(var i = $scope.profile.following.length - 1; i >= 0; i--){
            if($scope.profile.following[i]._id === $scope.user._id){
              $scope.profile.following.splice(i, 1);
              $scope.profile.friends.push($scope.user);
              return;
            }
          }
          $scope.profile.followers.push($scope.user);

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
