'use strict';

angular.module('core').controller('FaqController', ['$scope', 'Authentication', 'Users', 'Profile',
  function ($scope, Authentication, Users, Profile) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;

    $scope.faqs = [
      {
        title: 'How do I add a set of pronouns to my profile?',
        content: 'First browse through the available list of pronouns and click on yours. Then click the "+" icon to add the pronoun.'
      },
      {
        title: 'What if my pronouns don\'t exist in the list yet?',
        content: 'Click on "Create pronouns" and enter your information. Then you can click the "+" icon and add it right away. The pronoun will be reviewed by a staff member later and additional details may appear on the page.'
      }
    ];
  }
]);
