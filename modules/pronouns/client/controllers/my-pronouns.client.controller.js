'use strict';

angular.module('pronouns').controller('MyPronounListController', ['$http', '$scope', '$filter', 'Users', 'Authentication', 'Pronouns',
  function ($http, $scope, $filter, Users, Authentication, Pronouns) {
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;

    Pronouns.mine(function (data) {
      $scope.pronouns = data;
      $scope.buildPager();
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


