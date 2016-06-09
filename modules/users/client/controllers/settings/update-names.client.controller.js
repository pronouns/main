'use strict';

angular.module('users').controller('UpdateNamesController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    $scope.names = $scope.user.names;
    $scope.newName = '';

    if($scope.user.displayName !== null && $scope.names.length === 0){
      $scope.names[0] = $scope.user.displayName;
      $scope.user.displayName = null;
    }

    $scope.addName = function (){
      if($scope.newName.length > 0) {
        $scope.names.push($scope.newName);
        $scope.updateNames();
        $scope.newName = '';
      }
    };

    $scope.removeName = function(name){
      $scope.names.splice($scope.names.indexOf(name), 1);
      $scope.updateNames();
    };

    // Update a user profile
    $scope.updateNames = function (isValid) {
      $scope.user.names = $scope.names;

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.success = true;
        Authentication.user = response;
        $scope.user = Authentication.user;
        $scope.names = $scope.user.names;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

