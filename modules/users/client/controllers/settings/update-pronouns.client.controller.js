'use strict';

angular.module('users').controller('UpdatePronounsController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'Pronouns',
  function ($scope, $http, $location, Users, Authentication, Pronouns) {
    $scope.user = Authentication.user;

    console.log($scope.user);
  }
]);

