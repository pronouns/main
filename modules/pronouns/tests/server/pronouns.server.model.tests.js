'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose');


var User, Pronoun;

/**
 * Globals
 */
var user, xPronoun, mPronoun;

before(function (done) {
  User = mongoose.model('User');
  Pronoun = mongoose.model('Pronoun');
  done();
});

/**
 * Unit tests
 */
describe('Pronoun Model Unit Tests:', function () {

  beforeEach(function (done) {
    user = new User({
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3',
      roles: ['user', 'admin'],
      provider: 'local'
    });

    user.save(function () {
      xPronoun = new Pronoun({
        pronounType: 'X',
        subject: 'they',
        object: 'them',
        determiner: 'their',
        possessive: 'theirs',
        reflexive: 'themself',
        user: user,
        pattern: 'they/them/their/theirs/themself',
        listed: true
      });
      mPronoun = new Pronoun({
        title: 'Pronoun Title',
        pronounType: 'M',
        content: 'Pronoun Content',
        user: user,
        listed: true
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save standard pronoun without problems', function (done) {
      this.timeout(10000);
      xPronoun.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when trying to save standard pronoun without pronoun', function (done) {
      xPronoun.subject = '';
      this.timeout(10000);

      xPronoun.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to save non-standard pronoun without problems', function (done) {
      this.timeout(10000);
      mPronoun.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when trying to save non-standard pronoun without title', function (done) {
      mPronoun.title = '';
      this.timeout(10000);

      mPronoun.save(function (err) {
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
