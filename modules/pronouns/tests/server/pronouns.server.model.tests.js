'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Pronoun = mongoose.model('Pronoun');

/**
 * Globals
 */
var user, pronoun;

/**
 * Unit tests
 */
describe('Pronoun Model Unit Tests:', function () {

  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    });

    user.save(function () {
      pronoun = new Pronoun({
        title: 'Pronoun Title',
        content: 'Pronoun Content',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(10000);
      return pronoun.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without title', function (done) {
      pronoun.title = '';

      return pronoun.save(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Pronoun.remove().exec(function () {
      User.remove().exec(done);
    });
  });
});
