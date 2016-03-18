'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored 
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('pronouns');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core', 'ui.sortable']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('faq', {
      url: '/faq',
      templateUrl: 'modules/core/client/views/faq.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);

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

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', '$http', 'Authentication', 'Users', 'Profile',
  function ($scope, $http, Authentication, Users, Profile) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;

    $scope.following = [];
    $scope.searchResults = [];
    $scope.selectedUser = undefined;

    $scope.reloadFollowing = function() {
      $scope.following = [];
      if ($scope.user) {
        $scope.user.following.forEach(function (value) {
          if (typeof value !== 'string') { // Following has already been loaded into user object
            $scope.following.push(value);
          }
          else {
            $scope.following.push(Profile.byId({ id: value }));
          }
        });
      }
    };

    $scope.getUsers = function(val) {
      return $http.get('/api/users/search/' + val).then(function(response){
        for(var i = response.data.length -1; i >= 0; i--){
          if(response.data[i]._id === $scope.user._id || $scope.user.following.indexOf(response.data[i]._id) > -1){
            response.data.splice(i, 1);
          }
        }
        $scope.searchResults = response.data;
        return response.data;
      });
    };
    /*$scope.addFollowing = function () {
      if($scope.profile._id !== $scope.user._id) {
        var user = new Users($scope.user);
        user.following.push($scope.profile._id);

        user.$update(function (response) {
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      }
    };*/
    $scope.addFollowing = function(){
      console.log($scope.selectedUser);
      if($scope.selectedUser !== undefined && $scope.selectedUser._id){
        if($scope.selectedUser._id !== $scope.user._id) {
          var user = new Users($scope.user);
          user.following.push($scope.selectedUser._id);

          user.$update(function (response) {
            $scope.selectedUser = undefined;
            Authentication.user = response;
            $scope.user = Authentication.user;

            $scope.reloadFollowing();

          }, function (response) {
            $scope.error = response.data.message;
          });
        }
      }
    };
    $scope.reloadFollowing();
  }
]);

'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

'use strict';

// Configuring the pronouns module
angular.module('pronouns').run(['Menus',
  function (Menus) {
    // Add the pronouns dropdown item
    Menus.addMenuItem('topbar', {
      title: 'List pronouns',
      state: 'pronouns.list',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'pronouns.list', {
      title: 'Public pronouns',
      state: 'pronouns.list.all'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'pronouns.list', {
      title: 'My pronouns',
      state: 'pronouns.list.mine',
      roles: ['user']
    });
    Menus.addMenuItem('topbar', {
      title: 'Create pronouns',
      state: 'pronouns.create',
      roles: ['user']
    });
  }
]);

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
        abstract: true,
        template: '<ui-view/>'
      })
      .state('pronouns.list.all', {
        url: '',
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

'use strict';

// Pronouns controller
angular.module('pronouns').controller('CreatePronounController', ['$scope', '$stateParams', '$location', 'Users', 'Authentication', 'Pronouns',
  function ($scope, $stateParams, $location, Users, Authentication, Pronouns) {
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

'use strict';

angular.module('pronouns').controller('PronounListController', ['$scope', '$filter', 'Users', 'Authentication', 'Pronouns',
  function ($scope, $filter, Users, Authentication, Pronouns) {
    Pronouns.query(function (data) {
      $scope.pronouns = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.pronouns, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);


'use strict';

angular.module('pronouns').controller('MyPronounListController', ['$http', '$scope', '$filter', 'Users', 'Authentication',
  function ($http, $scope, $filter, Users, Authentication) {
    $scope.authentication = Authentication;
    $scope.user = Authentication.user;

    $http.get('/api/pronouns/mine', {}).then(function(response){
      $scope.pronouns = response.data;
      $scope.buildPager();

    }, function(response){
      console.log(response);
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.pronouns, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);



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

'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('pronouns').factory('Pronouns', ['$resource',
  function ($resource) {
    return $resource('api/pronouns/:pronounId', {
      pronounId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);


'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }],
          ownedPronounsResolve: ['$stateParams', '$http', '$q', function ($stateParams, $http, $q) {
            var deferred = $q.defer();

            $http.get('/api/pronouns/user/' + $stateParams.userId, {}).then(function(response){
              deferred.resolve(response.data);
            }, function(response){
              deferred.resolve([]);
            });

            return deferred.promise;
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }],
          ownedPronounsResolve: ['$stateParams', '$http', '$q', function ($stateParams, $http, $q) {
            var deferred = $q.defer();

            $http.get('/api/pronouns/user/' + $stateParams.userId, {}).then(function(response){
              deferred.resolve(response.data);
            }, function(response){
              deferred.resolve([]);
            });

            return deferred.promise;
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.pronouns', {
        url: '/pronouns',
        templateUrl: 'modules/users/client/views/settings/update-pronouns.client.view.html',
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
          }]
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('settings.alerts', {
        url: '/alerts',
        templateUrl: 'modules/users/client/views/settings/manage-alerts.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      })
      .state('profile', {
        url: '/users/:username',
        templateUrl: 'modules/users/client/views/user-profile.client.view.html',
        controller: 'UserProfileController',
        resolve: {
          profileResolve: ['$stateParams', 'Profile', function ($stateParams, Profile) {
            return Profile.byUsername({
              username: $stateParams.username
            });
          }],
          followersResolve: ['$stateParams', 'Followers', function ($stateParams, Followers) {
            return Followers.byUsername({
              username: $stateParams.username
            });
          }]
        }
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve', 'ownedPronounsResolve',
  function ($scope, $state, Authentication, userResolve, ownedPronounsResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;
    $scope.ownedPronouns = ownedPronounsResolve;


    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('UserProfileController', ['$scope', 'Authentication', 'Users', 'Pronouns', '$q', 'profileResolve', 'followersResolve',
  function ($scope, Authentication, Users, Pronouns, $q, profileResolve, followersResolve) {
    $scope.authentication = Authentication;
    $scope.limits = {
      friends: 5,
      followers: 5,
      following: 5
    };
    $q.all([
      profileResolve.$promise,
      followersResolve.$promise
    ]).then(function(data){
      $scope.profile = data[0];
      $scope.profile.followers = data[1];
      $scope.createFriendList();
    });
    var intersect = function(a, b) {
      var t;
      if (b.length > a.length){
        t = b;
        b = a;
        a = t;
      }
      return a.filter(function (e) {
        for(var i = 0; i < b.length; i++){
          if(b[i]._id === e._id){
            return true;
          }
        }
        return false;
      });
    };
    var remove = function(array, remove) {
      return array.filter(function (e) {
        for(var i = 0; i < remove.length; i++){
          if(remove[i]._id === e._id){
            return false;
          }
        }
        return true;
      });
    };
    $scope.createFriendList = function() {
      $scope.profile.friends = intersect($scope.profile.following, $scope.profile.followers);

      $scope.profile.followers = remove($scope.profile.followers, $scope.profile.friends);

      $scope.profile.following = remove($scope.profile.following, $scope.profile.friends);
    };

    $scope.user = Authentication.user;

    $scope.addFollowing = function () {
      if($scope.profile._id !== $scope.user._id) {
        var user = new Users($scope.user);
        user.following.push($scope.profile._id);

        user.$update(function (response) {
          Authentication.user = response;
          $scope.user = response;
          $scope.profile.followers.push($scope.user);
          $scope.createFriendList();
        }, function (response) {
          $scope.error = response.data.message;
        });
      }
    };
    $scope.removeFollowing = function () {
      if($scope.profile._id !== $scope.user._id) {
        var user = new Users($scope.user);
        user.following.splice(user.following.indexOf($scope.profile._id), 1);

        user.$update(function (response) {
          Authentication.user = response;
          $scope.user = response;
          for(var i = $scope.profile.followers.length - 1; i >= 0; i--){
            if($scope.profile.followers[i]._id === $scope.user._id){
              $scope.profile.followers.splice(i, 1);
            }
          }
          for(var j = $scope.profile.friends.length - 1; j >= 0; j--){
            if($scope.profile.friends[j]._id === $scope.user._id){
              $scope.profile.friends.splice(j, 1);
              $scope.profile.following.push($scope.user);
            }
          }
        }, function (response) {
          $scope.error = response.data.message;
        });
      }
    };
    $scope.loadMore = function(thing) {
      $scope.limits[thing] = $scope.profile[thing].length + 5; //Just to be safe :P
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');
        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ManageAlertsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;
    $scope.alerts = {
      facebook: $scope.user.alertChannels.indexOf('facebook') > -1,
      email: $scope.user.alertChannels.indexOf('email') > -1,
      pushbullet: $scope.user.alertChannels.indexOf('pushbullet') > -1
    };

    // Update a user profile
    $scope.updateAlerts = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }
      $scope.user.alertChannels = [];
      if($scope.alerts.facebook){
        $scope.user.alertChannels.push('facebook');
      }
      if($scope.alerts.email){
        $scope.user.alertChannels.push('email');
      }
      if($scope.alerts.pushbullet){
        if($scope.user.pushbulletKey) {
          $scope.user.alertChannels.push('pushbullet');
        }
        else{
          $scope.alerts.pushbullet = false;
        }
      }
      var user = new Users($scope.user);


      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        $scope.user = response;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);


'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users').controller('UpdatePronounsController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'pronounsResolve',
  function ($scope, $http, $location, Users, Authentication, pronounsResolve) {

    $scope.user = Authentication.user;
    $scope.error = {
      alert: ''
    };
    $scope.pronouns = pronounsResolve;
    $scope.sortableOptions = {
      stop: function(e, ui) {
        if($scope.user.pronouns.length === $scope.pronouns.length) {
          $scope.user.pronouns = [];
          for (var i = 0; i < $scope.pronouns.length; i++) {
            if ($scope.pronouns[i]._id === null) {
              $scope.user.pronouns.push($scope.pronouns[i]); //If pronoun content hasn't been injected yet
            }
            else {
              $scope.user.pronouns.push($scope.pronouns[i]._id);
            }
          }
          var user = new Users($scope.user);
          user.$update(function (response) {
            Authentication.user = response;
            $scope.user = Authentication.user;
          }, function (response) {
            $scope.error = response.data.message;
          });
        }
      }
    };
    $scope.sendAlerts = function(){
      $http.get('/api/users/sendAlerts', {}).then(function(response) {
        $scope.error.alert = response.message;
        $scope.user.canSendAlert = false;
      }, function(response) {
        $scope.error.alert = response.message;
        $scope.user.canSendAlert = false;
      });
    };
    $scope.removeMine = function (pronoun) {
      var user = new Users($scope.user);
      var index = user.pronouns.indexOf(pronoun._id);
      user.pronouns.splice(index, 1);

      user.$update(function (response) {
        Authentication.user = response;
        $scope.user = Authentication.user;
        $scope.pronouns.splice(index, 1);
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
angular.module('users').factory('Profile', ['$resource',
  function ($resource) {
    return $resource('api/users/profile/get/:id/:username', {
      username: '@username',
      id: '@id'
    }, {
      'byUsername': {
        method: 'GET',
        url: 'api/users/profile/username/:username'
      },
      'byId': {
        method: 'GET',
        url: 'api/users/profile/id/:id'
      }
    });
  }
]);
angular.module('users').factory('Followers', ['$resource',
  function ($resource) {
    return $resource('api/users/followers/get/:id/:username', {
      username: '@username',
      id: '@id'
    }, {
      'byUsername': {
        method: 'GET',
        url: 'api/users/followers/username/:username',
        isArray: true
      },
      'byId': {
        method: 'GET',
        url: 'api/users/followers/id/:id',
        isArray: true
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

