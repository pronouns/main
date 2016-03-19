'use strict';

angular.module('users').controller('UpdatePronounsController', ['$scope', '$q', '$http', '$location', '$filter', 'Users', 'Authentication', 'pronounsResolve', 'publicListResolve', 'myListResolve',
  function ($scope, $q, $http, $location, $filter, Users, Authentication, pronounsResolve, publicListResolve, myListResolve) {

    $scope.user = Authentication.user;
    $scope.error = {
      alert: ''
    };
    $scope.pronouns = pronounsResolve;
    $scope.myList = myListResolve;
    $scope.publicList = publicListResolve;
    $scope.resolved = false;

    $q.all([
      $scope.pronouns,
      $scope.myList.$promise,
      $scope.publicList.$promise
    ]).then(function(data){
      $scope.pronouns = data[0];
      $scope.myList = data[1];
      $scope.publicList = data[2];

      for(var i = $scope.publicList.length-1; i >= 0; i--){
        for(var j = 0; j < $scope.pronouns.length; j++){
          if($scope.publicList[i]._id === $scope.pronouns[j]._id){
            $scope.publicList.splice(i, 1);
            break;
          }
        }
      }

      for(var k = $scope.myList.length-1; k >= 0; k--){
        for(var l = 0; l < $scope.pronouns.length; l++){
          console.log(k);
          if($scope.myList[k]._id === $scope.pronouns[l]._id){
            $scope.myList.splice(k, 1);
            break;
          }
        }
      }
      $scope.buildPager();
      $scope.resolved = true;
    });


    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 5;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.publicList, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };


    // Build current pronouns
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
      console.log(pronoun);
      user.pronouns.splice(index, 1);

      user.$update(function (response) {
        Authentication.user = response;
        $scope.user = Authentication.user;
        $scope.pronouns.splice(index, 1);
        if(pronoun.listed){
          $scope.publicList.push(pronoun);
          $scope.figureOutItemsToDisplay();
        }
        else{
          $scope.myList.push(pronoun);
        }
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
    $scope.addMine = function (pronoun) {
      var user = new Users($scope.user);
      var listed = pronoun.listed;
      var index = -1;

      if(listed){
        for(var i = 0; i < $scope.publicList.length; i++){
          if($scope.publicList[i]._id === pronoun._id){
            index = i;
            break;
          }
        }
      }
      else{
        for(var j = 0; j < $scope.myList.length; j++){
          if($scope.myList[j]._id === pronoun._id){
            index = j;
            break;
          }
        }
      }

      if(index > -1) {
        console.log(pronoun);
        user.pronouns.push(pronoun._id);

        user.$update(function (response) {
          Authentication.user = response;
          $scope.user = Authentication.user;
          $scope.pronouns.push(pronoun);
          if(listed){
            $scope.publicList.splice(index, 1);
            $scope.figureOutItemsToDisplay();
          }
          else{
            $scope.myList.splice(index, 1);
          }
        }, function (response) {
          $scope.error = response.data.message;
        });
      }
    };
  }
]);
