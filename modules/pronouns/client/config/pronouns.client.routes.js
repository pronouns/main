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
        url: '/list',
        abstract: true,
        template: '<ui-view/>'
      })
      .state('pronouns.list.all', {
        url: '/public',
        templateUrl: 'modules/pronouns/client/views/list-pronouns.client.view.html',
        controller: 'PronounListController'
      })
      .state('pronouns.list.mine', {
        url: '/mine',
        templateUrl: 'modules/pronouns/client/views/my-pronouns.client.view.html',
        controller: 'MyPronounListController'
      })
      .state('pronouns.create', {
        url: '/create',
        templateUrl: 'modules/pronouns/client/views/create-pronoun.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('pronouns.update', {
        url: '',
        templateUrl: 'modules/pronouns/client/views/update-pronouns.client.view.html',
        'controller': 'UpdatePronounsController'
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
