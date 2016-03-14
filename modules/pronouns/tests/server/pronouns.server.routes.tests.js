'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Pronoun = mongoose.model('Pronoun'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, pronoun;

/**
 * Pronoun routes tests
 */
describe('Pronoun CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local',
      roles: ['user', 'admin']
    });

    // Save a user to the test db and create new pronoun
    user.save(function () {
      pronoun = {
        pronounType: 'X',
        subject: 'they',
        object: 'them',
        determiner: 'their',
        possessive: 'theirs',
        reflexive: 'themself',
        pattern: 'they/them/their/theirs/themself',
        user: user,
        listed: true
      };

      done();
    });
  });

  it('should be able to save an pronoun if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new pronoun
        agent.post('/api/pronouns')
          .send(pronoun)
          .expect(200)
          .end(function (pronounSaveErr, pronounSaveRes) {
            // Handle pronoun save error
            if (pronounSaveErr) {
              return done(pronounSaveErr);
            }

            // Get a list of pronouns
            agent.get('/api/pronouns')
              .end(function (pronounsGetErr, pronounsGetRes) {
                // Handle pronoun save error
                if (pronounsGetErr) {
                  return done(pronounsGetErr);
                }

                // Get pronouns list
                var pronouns = pronounsGetRes.body;

                // Set assertions
                (pronouns[0].user._id).should.equal(userId);
                (pronouns[0].subject).should.match('they');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an pronoun if not logged in', function (done) {
    agent.post('/api/pronouns')
      .send(pronoun)
      .expect(403)
      .end(function (pronounSaveErr, pronounSaveRes) {
        // Call the assertion callback
        done(pronounSaveErr);
      });
  });

  it('should not be able to save an pronoun if missing a component', function (done) {
    // Invalidate title field
    pronoun.reflexive = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new pronoun
        agent.post('/api/pronouns')
          .send(pronoun)
          .expect(400)
          .end(function (pronounSaveErr, pronounSaveRes) {
            // Set message assertion
            (pronounSaveRes.body.message).should.match('Pronoun is missing a grammatical argument.');

            // Handle pronoun save error
            done(pronounSaveErr);
          });
      });
  });

  it('should be able to update an pronoun if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new pronoun
        agent.post('/api/pronouns')
          .send(pronoun)
          .expect(200)
          .end(function (pronounSaveErr, pronounSaveRes) {
            // Handle pronoun save error
            if (pronounSaveErr) {
              return done(pronounSaveErr);
            }

            // Update pronoun title
            pronoun.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing pronoun
            agent.put('/api/pronouns/' + pronounSaveRes.body._id)
              .send(pronoun)
              .expect(200)
              .end(function (pronounUpdateErr, pronounUpdateRes) {
                // Handle pronoun update error
                if (pronounUpdateErr) {
                  return done(pronounUpdateErr);
                }

                // Set assertions
                (pronounUpdateRes.body._id).should.equal(pronounSaveRes.body._id);
                (pronounUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of pronouns if not signed in', function (done) {
    // Create new pronoun model instance
    var pronounObj = new Pronoun(pronoun);

    // Save the pronoun
    pronounObj.save(function () {
      // Request pronouns
      request(app).get('/api/pronouns')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single pronoun if not signed in', function (done) {
    // Create new pronoun model instance
    var pronounObj = new Pronoun(pronoun);

    // Save the pronoun
    pronounObj.save(function () {
      request(app).get('/api/pronouns/' + pronounObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('reflexive', pronoun.reflexive);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single pronoun with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/pronouns/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Pronoun is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single pronoun which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent pronoun
    request(app).get('/api/pronouns/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No pronoun with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an pronoun if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new pronoun
        agent.post('/api/pronouns')
          .send(pronoun)
          .expect(200)
          .end(function (pronounSaveErr, pronounSaveRes) {
            // Handle pronoun save error
            if (pronounSaveErr) {
              return done(pronounSaveErr);
            }

            // Delete an existing pronoun
            agent.delete('/api/pronouns/' + pronounSaveRes.body._id)
              .send(pronoun)
              .expect(200)
              .end(function (pronounDeleteErr, pronounDeleteRes) {
                // Handle pronoun error error
                if (pronounDeleteErr) {
                  return done(pronounDeleteErr);
                }

                // Set assertions
                (pronounDeleteRes.body._id).should.equal(pronounSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an pronoun if not signed in', function (done) {
    // Set pronoun user
    pronoun.user = user;

    // Create new pronoun model instance
    var pronounObj = new Pronoun(pronoun);

    // Save the pronoun
    pronounObj.save(function () {
      // Try deleting pronoun
      request(app).delete('/api/pronouns/' + pronounObj._id)
        .expect(403)
        .end(function (pronounDeleteErr, pronounDeleteRes) {
          // Set message assertion
          (pronounDeleteRes.body.message).should.match('User is not authorized');

          // Handle pronoun error error
          done(pronounDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Pronoun.remove().exec(done);
    });
  });
});
