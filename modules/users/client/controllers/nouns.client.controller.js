'use strict';

angular.module('users').controller('NounsController', ['$scope', '$http', '$window', 'Authentication', 'Users', 'Profile',
  function ($scope, $http, $window, Authentication, Users, Profile) {

    $window.document.title = 'Update nouns';

    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;
    $scope.needsSave = false;
    $scope.nouns = ['man', 'woman', 'boyfriend', 'girlfriend', 'boy', 'girl', 'enby', 'enbyfriend', 'husband', 'wife', 'partner'];
    $scope.newGood = '';
    $scope.newBad = '';
    $scope.error = {};
    
    $scope.suggestSave = function(){
      $scope.needsSave = true;
    };
    
    $scope.removeNoun = function(noun){
      var index = $scope.user.nouns.goodWords.indexOf(noun);
      if(index > -1){
        $scope.user.nouns.goodWords.splice(index, 1);
        $scope.suggestSave();
      }
      else {
        index = $scope.user.nouns.badWords.indexOf(noun);
        if (index > -1) {
          $scope.user.nouns.badWords.splice(index, 1);
          $scope.suggestSave();
        }
      }
    };
    
    $scope.addGood = function(){
      $scope.newGood = $scope.newGood.trim();
      if($scope.newGood !== '' && $scope.user.nouns.goodWords.indexOf($scope.newGood) === -1 && $scope.user.nouns.badWords.indexOf($scope.newGood) === -1){
        $scope.user.nouns.goodWords.push($scope.newGood);
        $scope.suggestSave();
      }
      $scope.newGood = '';
    };

    $scope.addBad = function(){
      $scope.newBad = $scope.newBad.trim();
      if($scope.newBad !== '' && $scope.user.nouns.goodWords.indexOf($scope.newBad) === -1 && $scope.user.nouns.badWords.indexOf($scope.newBad) === -1){
        $scope.user.nouns.badWords.push($scope.newBad);
        $scope.suggestSave();
      }
      $scope.newBad = '';
    };
    $scope.updateUser = function(cb){
      var user = new Users($scope.user);
      user.$update(function (response) {
        Authentication.user = response;
        $scope.user = response;
        $scope.needsSave = false;
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
      if($scope.needsSave) {
        $scope.updateUser(function(){
          $scope.sendAlerts();
        });
      }
    };
  }
]);
