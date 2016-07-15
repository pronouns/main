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
        'controller': 'UpdatePronounsController',
        resolve: {
          pronounsResolve: ['$stateParams', 'Pronouns', 'Profile', 'Authentication', '$q', function ($stateParams, Pronouns, Profile, Authentication, $q) {
            /*var deferred = $q.defer();
             var processed = 0;
             var pronouns = [];
             var testPronouns = [];
             Authentication.user.pronouns.forEach(function(value){
             if(typeof value !== 'string'){ // Pronoun has already been loaded into user object
             testPronouns.push(value._id);
             pronouns[testPronouns.indexOf(value._id)] = value;
             processed++;
             if(processed === Authentication.user.pronouns.length){
             deferred.resolve(pronouns);
             }
             }
             else {
             testPronouns.push(value);
             Pronouns.get({ pronounId: value }, function (data) {
             pronouns[testPronouns.indexOf(data._id)] = data;
             processed++;
             if(processed === Authentication.user.pronouns.length){
             deferred.resolve(pronouns);
             }
             });
             }
             });
             return deferred.promise;*/
            //TODO make a better way for this
            var deferred = $q.defer();
            Profile.byId({ id: Authentication.user._id }, function (data) {
              deferred.resolve(data.pronouns);
            });
            return deferred.promise;
          }],
          publicListResolve: ['Pronouns', function (Pronouns) {
            return Pronouns.query();
          }],
          myListResolve: ['Pronouns', function (Pronouns) {
            return Pronouns.mine();
          }]
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
