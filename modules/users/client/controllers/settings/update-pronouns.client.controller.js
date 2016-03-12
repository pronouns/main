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
          if($scope.pronouns[i]._id === null){
            $scope.user.pronouns.push($scope.pronouns[i]); //If pronoun content hasn't been injected yet
          }
          else{
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
    };
    $scope.sendAlerts = function(){
      $http.get('/api/users/sendAlerts', {}).then(function(response) {
        console.log(response);
      }, function(response) {
        console.log(response);
      });
    };
    $scope.user.pronouns.forEach(function(value){
      if(typeof value !== 'string'){ // Pronoun has already been loaded into user object
        $scope.testPronouns.push(value._id);
        $scope.pronouns[$scope.testPronouns.indexOf(value._id)] = value;
      }
      else {
        $scope.testPronouns.push(value);
        Pronouns.get({ pronounId: value }, function (data) {
          $scope.pronouns[$scope.testPronouns.indexOf(data._id)] = data;
        });
      }
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

