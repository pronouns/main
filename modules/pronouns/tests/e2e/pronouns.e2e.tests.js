'use strict';

describe('Pronouns E2E Tests:', function () {
  describe('Test pronouns page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/pronouns');
      expect(element.all(by.repeater('pronoun in pronouns')).count()).toEqual(0);
    });
  });
});
