'use strict';

angular.module('users').controller('AccessibilityFeaturesController', ['$scope', '$http', '$location', '$window', 'Users', 'Authentication',
  function ($scope, $http, $location, $window, Users, Authentication) {
    $window.document.title = 'Accessibility Features';

    $scope.user = Authentication.user;
    $scope.features = {
      font: $scope.user.featureToggles.indexOf('font') > -1,
      contrast: $scope.user.featureToggles.indexOf('contrast') > -1,
      textSize: $scope.user.featureToggles.indexOf('textSize') > -1
    };

    // Update a user profile
    $scope.updateFeatures = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }
      $scope.user.featureToggles = [];
      if($scope.features.font){
        $scope.user.featureToggles.push('font');


        //Instant enable of OpenDyslexic. There is no instant disable though :P
        var node = document.createElement('style');
        node.innerHTML = 'body { font-family: \'OpenDyslexic\' !important; }';
        document.body.appendChild(node);

      }
      if($scope.features.textSize){
        $scope.user.featureToggles.push('textSize');

      }
      if($scope.features.contrast){
        $scope.user.featureToggles.push('contrast');

        var cssId = 'contrastCss'; // you could encode the css path itself to generate id..
        if (!document.getElementById(cssId))
        {
          var head = document.getElementsByTagName('head')[0];
          var link = document.createElement('link');
          link.id = cssId;
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = '/accessibility.css';
          link.media = 'all';
          head.appendChild(link);
        }
      }

      var user = new Users($scope.user);


      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        console.log(response);

        $scope.success = true;
        $scope.user = response;
        Authentication.user = response;
      }, function (response) {
        console.log(response);
        $scope.error = response.data.message;
      });
    };
  }
]);

