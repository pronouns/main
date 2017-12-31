'use strict';

angular.module('users').controller('UpdateNamesController', ['$scope', '$http', '$location', '$window', 'Users', 'Authentication',
  function ($scope, $http, $location, $window, Users, Authentication) {
    $window.document.title = 'Update names';

    $scope.user = Authentication.user;

    $scope.names = $scope.user.names;
    $scope.newName = '';

    if($scope.user.displayName !== undefined && $scope.user.displayName !== null && $scope.names.length === 0){
      $scope.names[0] = $scope.user.displayName;
      $scope.user.displayName = null;
    }

    $scope.addName = function (){
      if($scope.newName.length > 0) {
        $scope.names.push($scope.newName);
        $scope.saveAndAlert();
        $scope.newName = '';
      }
    };

    $scope.removeName = function(name){
      $scope.names.splice($scope.names.indexOf(name), 1);
      $scope.saveAndAlert();
    };

    // Update a user profile
    $scope.updateUser = function (cb) {
      $scope.user.names = $scope.names;

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.success = true;
        Authentication.user = response;
        $scope.user = Authentication.user;
        $scope.names = $scope.user.names;
        cb();
      }, function (response) {
        $scope.error = response.data.message;
        cb(response);
      });
    };
    $scope.sendAlerts = function(){
      $http.post('/api/alerts', {}).then(function(response) {
        $scope.error.alert = response.message;
        $scope.user.canSendAlert = false;
      }, function(response) {
        $scope.error.alert = response.message;
        $scope.user.canSendAlert = false;
      });
    };
    $scope.saveAndAlert = function(){
      $scope.updateUser(function(){
        $scope.sendAlerts();
      });
    };
  }
]);

