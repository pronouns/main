'use strict';

angular.module('users').controller('UpdatePronounsController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'Pronouns',
  function ($scope, $http, $location, Users, Authentication, Pronouns) {
    $scope.user = Authentication.user;
    $scope.pronouns = [];
    for(var i = 0; i < $scope.user.pronouns.length; i++){
      Pronouns.get({ pronounId: $scope.user.pronouns[i] }, function(data) {
        $scope.pronouns.push(data);
      });
    }
  }
]);

