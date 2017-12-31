'use strict';

angular.module('core').controller('SitemapController', ['$scope', '$window', '$sce', 'Authentication', 'Users', 'Profile',
  function ($scope, $window, $sce, Authentication, Users, Profile) {
    $window.document.title = 'Sitemap';

    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;
  }
]);
