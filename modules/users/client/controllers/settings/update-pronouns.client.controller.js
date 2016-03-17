'use strict';

angular.module('users').controller('UpdatePronounsController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'pronounsResolve',
  function ($scope, $http, $location, Users, Authentication, pronounsResolve) {

    $scope.user = Authentication.user;
    $scope.error = {
      alert: ''
    };
    $scope.pronouns = pronounsResolve;
    $scope.sortableOptions = {
      stop: function(e, ui) {
        if($scope.user.pronouns.length === $scope.pronouns.length) {
          $scope.user.pronouns = [];
          for (var i = 0; i < $scope.pronouns.length; i++) {
            if ($scope.pronouns[i]._id === null) {
              $scope.user.pronouns.push($scope.pronouns[i]); //If pronoun content hasn't been injected yet
            }
            else {
              $scope.user.pronouns.push($scope.pronouns[i]._id);
            }
          }
          var user = new Users($scope.user);
          user.$update(function (response) {
            Authentication.user = response;
            $scope.user = Authentication.user;
          }, function (response) {
            $scope.error = response.data.message;
          });
        }
      }
    };
    $scope.sendAlerts = function(){
      $http.get('/api/users/sendAlerts', {}).then(function(response) {
        $scope.error.alert = response.message;
        $scope.user.canSendAlert = false;
      }, function(response) {
        $scope.error.alert = response.message;
        $scope.user.canSendAlert = false;
      });
    };
    $scope.removeMine = function (pronoun) {
      var user = new Users($scope.user);
      var index = user.pronouns.indexOf(pronoun._id);
      user.pronouns.splice(index, 1);

      user.$update(function (response) {
        Authentication.user = response;
        $scope.user = Authentication.user;
        $scope.pronouns.splice(index, 1);
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

