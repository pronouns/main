'use strict';

angular.module('users').controller('ManageAlertsController', ['$scope', '$http', '$location', '$window', 'Users', 'Authentication',
  function ($scope, $http, $location, $window, Users, Authentication) {
    $window.document.title = 'Manage Alerts';

    $scope.user = Authentication.user;
    $scope.alerts = {
      facebook: $scope.user.alertChannels.indexOf('facebook') > -1,
      email: $scope.user.alertChannels.indexOf('email') > -1,
      pushbullet: $scope.user.alertChannels.indexOf('pushbullet') > -1
    };

    // Update a user profile
    $scope.updateAlerts = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }
      $scope.user.alertChannels = [];
      if($scope.alerts.facebook){
        $scope.user.alertChannels.push('facebook');
      }
      if($scope.alerts.email){
        $scope.user.alertChannels.push('email');
      }
      if($scope.alerts.pushbullet){
        if($scope.user.pushbulletKey) {
          $scope.user.alertChannels.push('pushbullet');
        }
        else{
          $scope.alerts.pushbullet = false;
        }
      }
      var user = new Users($scope.user);


      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        $scope.user = response;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

