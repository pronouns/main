'use strict';

angular.module('pronouns').controller('PronounListController', ['$scope', '$filter', '$window', 'Users', 'Authentication', 'Pronouns',
  function ($scope, $filter, $window, Users, Authentication, Pronouns) {
    $window.document.title = 'Public pronoun list';

    $scope.authentication = Authentication;
    $scope.user = Authentication.user;

    Pronouns.query(function (data) {
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

