'use strict';

angular.module('core').controller('HomeController', ['$scope', '$http', 'Authentication', 'Users', 'Profile', 'Pronouns',
  function ($scope, $http, Authentication, Users, Profile, Pronouns) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;

    $scope.following = [];
    $scope.searchResults = [];
    $scope.selectedUser = undefined;
    $scope.pronouns = [];
    $scope.randomPronoun = undefined;

    Pronouns.query(function (data) {
      $scope.pronouns = data;
      console.log($scope.pronouns);
      $scope.pickRandomPronouns();
    });

    $scope.pickRandomPronouns = function () {
      $scope.randomPronouns = getRandomSubarray($scope.pronouns, Math.min(3, $scope.pronouns.length));
    };

    function getRandomSubarray(arr, size) {
      var shuffled = arr.slice(0), i = arr.length, temp, index;
      while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
      }
      return shuffled.slice(0, size);
    }


    $scope.reloadFollowing = function() {
      $scope.following = [];
      if ($scope.user) {
        $http.get('/api/users/me/following').then(function(response){
          if(response.data.following !== null) {
            $scope.following = response.data.following;
            if($scope.following.length === 0){
              $scope.user.following = [];
            }
          }
          console.log(response);
        });
      }
    };

    $scope.getUsers = function(val) {
      return $http.get('/api/users/search/' + val).then(function(response){
        for(var i = response.data.length -1; i >= 0; i--){
          if(response.data[i]._id === $scope.user._id || $scope.user.following.indexOf(response.data[i]._id) > -1){
            response.data.splice(i, 1);
          }
        }
        $scope.searchResults = response.data;
        return response.data;
      });
    };
    /*$scope.addFollowing = function () {
      if($scope.profile._id !== $scope.user._id) {
        var user = new Users($scope.user);
        user.following.push($scope.profile._id);

        user.$update(function (response) {
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      }
    };*/
    $scope.addFollowing = function(){
      console.log($scope.selectedUser);
      if($scope.selectedUser !== undefined && $scope.selectedUser._id){
        if($scope.selectedUser._id !== $scope.user._id) {
          var user = new Users($scope.user);
          user.following.push($scope.selectedUser._id);

          user.$update(function (response) {
            $scope.selectedUser = undefined;
            Authentication.user = response;
            $scope.user = Authentication.user;

            $scope.reloadFollowing();

          }, function (response) {
            $scope.error = response.data.message;
          });
        }
      }
    };
    $scope.reloadFollowing();
  }


]);
