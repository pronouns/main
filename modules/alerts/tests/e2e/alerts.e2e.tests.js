'use strict';

describe('Alerts E2E Tests:', function () {
  describe('Test Alerts page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/alerts');
      expect(element.all(by.repeater('alert in alerts')).count()).toEqual(0);
    });
  });
});
