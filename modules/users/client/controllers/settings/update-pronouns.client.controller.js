'use strict';

angular.module('users').controller('UpdatePronounsController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'Pronouns',
  function ($scope, $http, $location, Users, Authentication, Pronouns) {

    $scope.user = Authentication.user;
    $scope.pronouns = [];
    $scope.testPronouns = [];
    $scope.sortableOptions = {
      stop: function(e, ui) {
        $scope.pronouns.forEach(function(value){
          Pronouns.get({ pronounId: value }, function(data) {
            $scope.pronouns.push(data);
          });
        });
        $scope.user.pronouns = [];
        for(var i = 0; i < $scope.pronouns.length; i++){
          $scope.user.pronouns.push($scope.pronouns[i]._id);
        }
        var user = new Users($scope.user);
        user.$update(function (response) {
          Authentication.user = response;
          $scope.user = Authentication.user;
        }, function (response) {
          $scope.error = response.data.message;
        });
      }
    };
    $scope.user.pronouns.forEach(function(value){
      $scope.testPronouns.push(value);
      Pronouns.get({ pronounId: value }, function(data) {
        $scope.pronouns[$scope.testPronouns.indexOf(data._id)] = data;
      });
    });

    $scope.removeMine = function (pronoun) {
      var user = new Users($scope.user);
      user.pronouns.splice(user.pronouns.indexOf(pronoun._id), 1);

      user.$update(function (response) {
        Authentication.user = response;
        $scope.user = Authentication.user;
        $scope.pronouns = [];
        $scope.user.pronouns.forEach(function(value){
          Pronouns.get({ pronounId: value }, function(data) {
            $scope.pronouns.push(data);
          });
        });
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

