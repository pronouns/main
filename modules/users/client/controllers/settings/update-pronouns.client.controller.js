'use strict';

angular.module('users').controller('UpdatePronounsController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'Pronouns',
  function ($scope, $http, $location, Users, Authentication, Pronouns) {
    $scope.user = Authentication.user;
    $scope.pronouns = [];
    $scope.user.pronouns.forEach(function(value){
      Pronouns.get({ pronounId: value }, function(data) {
        $scope.pronouns.push(data);
      });
    });
  }
]);

