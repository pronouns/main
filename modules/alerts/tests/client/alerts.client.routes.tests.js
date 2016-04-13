(function () {
  'use strict';

  describe('Alerts Route Tests', function () {
    // Initialize global variables
    var $scope,
      AlertsService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _AlertsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      AlertsService = _AlertsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('alerts');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/alerts');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          AlertsController,
          mockAlert;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('alerts.view');
          $templateCache.put('modules/alerts/client/views/view-alert.client.view.html', '');

          // create mock Alert
          mockAlert = new AlertsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Alert Name'
          });

          //Initialize Controller
          AlertsController = $controller('AlertsController as vm', {
            $scope: $scope,
            alertResolve: mockAlert
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:alertId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.alertResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            alertId: 1
          })).toEqual('/alerts/1');
        }));

        it('should attach an Alert to the controller scope', function () {
          expect($scope.vm.alert._id).toBe(mockAlert._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/alerts/client/views/view-alert.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          AlertsController,
          mockAlert;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('alerts.create');
          $templateCache.put('modules/alerts/client/views/form-alert.client.view.html', '');

          // create mock Alert
          mockAlert = new AlertsService();

          //Initialize Controller
          AlertsController = $controller('AlertsController as vm', {
            $scope: $scope,
            alertResolve: mockAlert
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.alertResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/alerts/create');
        }));

        it('should attach an Alert to the controller scope', function () {
          expect($scope.vm.alert._id).toBe(mockAlert._id);
          expect($scope.vm.alert._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/alerts/client/views/form-alert.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          AlertsController,
          mockAlert;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('alerts.edit');
          $templateCache.put('modules/alerts/client/views/form-alert.client.view.html', '');

          // create mock Alert
          mockAlert = new AlertsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Alert Name'
          });

          //Initialize Controller
          AlertsController = $controller('AlertsController as vm', {
            $scope: $scope,
            alertResolve: mockAlert
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:alertId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.alertResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            alertId: 1
          })).toEqual('/alerts/1/edit');
        }));

        it('should attach an Alert to the controller scope', function () {
          expect($scope.vm.alert._id).toBe(mockAlert._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/alerts/client/views/form-alert.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
