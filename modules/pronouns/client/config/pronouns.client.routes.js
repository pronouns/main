'use strict';

// Setting up route
angular.module('pronouns').config(['$stateProvider',
  function ($stateProvider) {
    // pronouns state routing
    $stateProvider
      .state('pronouns', {
        abstract: true,
        url: '/pronouns',
        template: '<ui-view/>'
      })
      .state('pronouns.list', {
        url: '',
        templateUrl: 'modules/pronouns/client/views/list-pronouns.client.view.html',
        controller: 'PronounListController'
      })
      .state('pronouns.create', {
        url: '/create',
        templateUrl: 'modules/pronouns/client/views/create-pronoun.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('pronouns.view', {
        url: '/:pronounId',
        templateUrl: 'modules/pronouns/client/views/view-pronoun.client.view.html'
      })
      .state('pronouns.edit', {
        url: '/:pronounId/edit',
        templateUrl: 'modules/pronouns/client/views/edit-pronoun.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
