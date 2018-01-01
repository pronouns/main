'use strict';

// Pronouns controller
angular.module('pronouns').controller('CreatePronounController', ['$scope', '$stateParams', '$location', '$window', 'Users', 'Authentication', 'Pronouns',
  function ($scope, $stateParams, $location, $window, Users, Authentication, Pronouns) {
    $window.document.title = 'Create pronoun set';

    $scope.authentication = Authentication;
    $scope.user = Authentication.user;
    $scope.pronoun = {};

    $scope.pronounType = 'X';

    $scope.setType = function(type){
      $scope.pronounType = type;
    };

    $scope.submit = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'pronounForm');
        return false;
      }
      var pronoun = {};
      console.log($scope.pronounType);
      if($scope.pronounType === 'X') {
        // Create new Pronoun object
        pronoun = new Pronouns({
          subject: $scope.pronoun.subject,
          object: $scope.pronoun.object,
          determiner: $scope.pronoun.determiner,
          possessive: $scope.pronoun.possessive,
          reflexive: $scope.pronoun.reflexive,
          title: $scope.pronoun.title,
          pronounType: 'X',
          listed: $scope.pronoun.listed === true
        });
      }
      if($scope.pronounType === 'M') {
        // Create new Pronoun object
        pronoun = new Pronouns({
          content: $scope.pronoun.content,
          title: $scope.pronoun.title,
          pronounType: 'M',
          listed: $scope.pronoun.listed === true && $scope.user.roles.indexOf('admin') !== -1
        });
      }

      // Redirect after save
      pronoun.$save(function (response) {
        $location.path('pronouns/' + response._id);

        // Clear form fields
        $scope.subject = '';
        $scope.object = '';
        $scope.determiner = '';
        $scope.possessive = '';
        $scope.reflexive = '';
        $scope.title = '';
        $scope.content = '';

      }, function (errorResponse) {
        console.log(errorResponse);
        $scope.error = errorResponse.data.message;
      });
    };

  }
]);
