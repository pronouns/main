'use strict';

angular.module('pronouns').controller('MyPronounListController', ['$http', '$scope', '$filter', 'Users', 'Authentication',
  function ($http, $scope, $filter, Users, Authentication) {
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;

    $http.get('/api/pronouns/mine', {}).then(function(response){
      $scope.pronouns = response.data;
      $scope.buildPager();

    }, function(response){
      console.log(response);
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.pronouns, {
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
  }
]);


