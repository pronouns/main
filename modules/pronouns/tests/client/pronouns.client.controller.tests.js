'use strict';

(function () {
  // Pronouns Controller Spec
  describe('Pronouns Controller Tests', function () {
    // Initialize global variables
    var PronounsController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Pronouns,
      mockPronoun;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Pronouns_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Pronouns = _Pronouns_;

      // create mock pronoun
      mockPronoun = new Pronouns({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Pronoun about MEAN',
        pronounType: 'M',
        content: 'MEAN rocks!',
        listed: false
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Pronouns controller.
      PronounsController = $controller('PronounsController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one pronoun object fetched from XHR', inject(function (Pronouns) {
      // Create a sample pronouns array that includes the new pronoun
      var samplePronouns = [mockPronoun];

      // Set GET response
      $httpBackend.expectGET('api/pronouns').respond(samplePronouns);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.pronouns).toEqualData(samplePronouns);
    }));

    it('$scope.findOne() should create an array with one pronoun object fetched from XHR using a pronounId URL parameter', inject(function (Pronouns) {
      // Set the URL parameter
      $stateParams.pronounId = mockPronoun._id;

      // Set GET response
      $httpBackend.expectGET(/api\/pronouns\/([0-9a-fA-F]{24})$/).respond(mockPronoun);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.pronoun).toEqualData(mockPronoun);
    }));

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock pronoun in scope
        scope.pronoun = mockPronoun;
      });

      it('should update a valid pronoun', inject(function (Pronouns) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/pronouns\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/pronouns/' + mockPronoun._id);
      }));

      it('should set scope.error to error response message', inject(function (Pronouns) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/pronouns\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(pronoun)', function () {
      beforeEach(function () {
        // Create new pronouns array and include the pronoun
        scope.pronouns = [mockPronoun, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/pronouns\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockPronoun);
      });

      it('should send a DELETE request with a valid pronounId and remove the pronoun from the scope', inject(function (Pronouns) {
        expect(scope.pronouns.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.pronoun = mockPronoun;

        $httpBackend.expectDELETE(/api\/pronouns\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to pronouns', function () {
        expect($location.path).toHaveBeenCalledWith('pronouns');
      });
    });
  });
}());
