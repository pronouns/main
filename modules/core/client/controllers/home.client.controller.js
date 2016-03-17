'use strict';

angular.module('core').controller('HomeController', ['$scope', '$http', 'Authentication', 'Users', 'Profile',
  function ($scope, $http, Authentication, Users, Profile) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;

    $scope.friends = [];
    $scope.searchResults = [];
    $scope.selectedUser = undefined;

    $scope.reloadFriends = function() {
      $scope.friends = [];
      if ($scope.user) {
        $scope.user.friends.forEach(function (value) {
          if (typeof value !== 'string') { // Friend has already been loaded into user object
            $scope.friends[$scope.user.friends.indexOf(value._id)] = value;
          }
          else {
            Profile.byId({ id: value }, function (data) {
              $scope.friends[$scope.user.friends.indexOf(data._id)] = data;
            });
          }
        });
      }
    };

    $scope.getUsers = function(val) {
      return $http.get('/api/users/search/' + val).then(function(response){
        for(var i = response.data.length -1; i >= 0; i--){
          if(response.data[i]._id === $scope.user._id || $scope.user.friends.indexOf(response.data[i]._id) > -1){
            response.data.splice(i, 1);
          }
        }
        $scope.searchResults = response.data;
        return response.data;
      });
    };
    /*$scope.addFriend = function () {
      if($scope.profile._id !== $scope.user._id) {
        var user = new Users($scope.user);
        user.friends.push($scope.profile._id);

        user.$update(function (response) {
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      }
    };*/
    $scope.addFriend = function(){
      console.log($scope.selectedUser);
      if($scope.selectedUser !== undefined && $scope.selectedUser._id){
        if($scope.selectedUser._id !== $scope.user._id) {
          var user = new Users($scope.user);
          user.friends.push($scope.selectedUser._id);

          user.$update(function (response) {
            $scope.selectedUser = undefined;
            Authentication.user = response;
            $scope.user = Authentication.user;
            $scope.reloadFriends();

          }, function (response) {
            $scope.error = response.data.message;
          });
        }
      }
    };
    $scope.reloadFriends();
  }
]);
