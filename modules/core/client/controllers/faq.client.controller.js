'use strict';

angular.module('core').controller('FaqController', ['$scope', '$sce', 'Authentication', 'Users', 'Profile',
  function ($scope, $sce, Authentication, Users, Profile) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;


    $scope.faqs = [
      {
        title: 'How do I add a set of pronouns to my profile?',
        content: 'Click on "Pronouns" in the menu when you are logged in. Browse through the public and private pronoun lists and click "+" to add pronouns to your profile.'
      },
      {
        title: 'What if my pronouns don\'t exist in the list yet?',
        content: 'Go to "Pronouns" and click on "Create new". Now enter your information. Then you can click the "+" icon on the page and add it right away. If you choose to make the pronoun "listed", it will be reviewed by a staff member later and additional details may appear on the page. Making the pronoun "listed" means that it will appear on the public list and any user will be allowed to use it.'
      },
      {
        title: 'Can I order my pronouns by preference?',
        content: 'Yes, you can go to the "update pronouns" page and drag to re-order pronouns.'
      },
      {
        title: 'Why don\'t I have the option to make a "non-standard" pronoun public?',
        content: 'This is a security precaution. Non-standard pronouns have the potential to be much more personal than simple standard ones. Users are not allowed to make them public at this time to prevent issues with other users using pronouns which are intended to be personal. If you think the list is missing a non-standard pronoun, you can email <a href="mailto:me@falkirks.com">me@falkirks.com</a> and it can be added.'
      },
      {
        title: 'Can pronouns be edited after they are submitted?',
        content: 'Yes, but only if you do <b>not</b> check the "listed" box. If you check "listed", the pronoun will be publicly available and only staff members will be able to make revisions to it.'
      },
      {
        title: 'What are "suggested" users? How does Pronouny pick them?',
        content: 'Suggested users are people Pronouny thinks you may be interested in following. To generate the suggested users list, Pronouny finds the users that are followed by the people you follow and ranks them by the times they are followed by people you follow. You can have up to 10 suggested users and they will be updated every 10 minutes.'
      }
    ];
    for(var i = 0; i < $scope.faqs.length; i++){
      $scope.faqs[i].content = $sce.trustAsHtml($scope.faqs[i].content);
    }
  }
]);
