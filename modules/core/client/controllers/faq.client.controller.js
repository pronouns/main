'use strict';

angular.module('core').controller('FaqController', ['$scope', 'Authentication', 'Users', 'Profile',
  function ($scope, Authentication, Users, Profile) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;

    $scope.faqs = [
      {
        title: 'How do I add a set of pronouns to my profile?',
        content: 'First browse through the available list of pronouns and click on the one you want. Then click the "+" icon to add the pronoun.'
      },
      {
        title: 'What if my pronouns don\'t exist in the list yet?',
        content: 'Click on "Create pronouns" and enter your information. Then you can click the "+" icon and add it right away. If you choose to make the pronoun "listed", it will be reviewed by a staff member later and additional details may appear on the page.'
      },
      {
        title: 'Can I order my pronouns by preference?',
        content: 'Yes, but at this point you can\'t use a touch screen to do this. You can go to the "update pronouns" page and drag to re-order pronouns.'
      }
    ];
  }
]);
