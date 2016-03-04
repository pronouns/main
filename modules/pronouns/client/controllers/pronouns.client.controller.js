'use strict';

// Pronouns controller
angular.module('pronouns').controller('PronounsController', ['$scope', '$stateParams', '$location', 'Users', 'Authentication', 'Pronouns',
  function ($scope, $stateParams, $location, Users, Authentication, Pronouns) {
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;
    $scope.pronounType = 'X';

    $scope.hasPronoun = function (pronounId) {
      for (var i = 0; i < $scope.user.pronouns.length; i++) {
        if ($scope.user.pronouns[i] === pronounId) {
          return true;
        }
      }
      return false;
    };
    $scope.makeMine = function (pronoun) {
      var user = new Users($scope.user);
      user.pronouns.push(pronoun._id);

      user.$update(function (response) {
        Authentication.user = response;
        $scope.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
    $scope.removeMine = function (pronoun) {
      var user = new Users($scope.user);
      user.pronouns.splice(user.pronouns.indexOf(pronoun._id), 1);

      user.$update(function (response) {
        Authentication.user = response;
        $scope.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
// Remove existing Pronoun
    $scope.remove = function (pronoun) {
      if (pronoun) {
        pronoun.$remove();

        for (var i in $scope.pronouns) {
          if ($scope.pronouns[i] === pronoun) {
            $scope.pronouns.splice(i, 1);
          }
        }
      } else {
        $scope.pronoun.$remove(function () {
          $location.path('pronouns');
        });
      }
    };

// Update existing Pronoun
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'pronounForm');

        return false;
      }

      var pronoun = $scope.pronoun;

      pronoun.$update(function () {
        $location.path('pronouns/' + pronoun._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

// Find a list of Pronouns
    $scope.find = function () {
      $scope.pronouns = Pronouns.query();
    };

// Find existing Pronoun
    $scope.findOne = function () {
      $scope.pronoun = Pronouns.get({
        pronounId: $stateParams.pronounId
      });
      console.log($scope.pronoun);
    };
  }
]);
