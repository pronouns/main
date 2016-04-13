'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Alert = mongoose.model('Alert'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
//var app, agent, credentials, user, alert;

/**
 * Alert routes tests
 */
/*describe('Alert CRUD tests', function () {

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
      provider: 'local'
    });

    // Save a user to the test db and create new Alert
    user.save(function () {
      alert = {
        name: 'Alert name'
      };

      done();
    });
  });

  it('should be able to save a Alert if logged in', function (done) {
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

        // Save a new Alert
        agent.post('/api/alerts')
          .send(alert)
          .expect(200)
          .end(function (alertSaveErr, alertSaveRes) {
            // Handle Alert save error
            if (alertSaveErr) {
              return done(alertSaveErr);
            }

            // Get a list of Alerts
            agent.get('/api/alerts')
              .end(function (alertsGetErr, alertsGetRes) {
                // Handle Alert save error
                if (alertsGetErr) {
                  return done(alertsGetErr);
                }

                // Get Alerts list
                var alerts = alertsGetRes.body;

                // Set assertions
                (alerts[0].user._id).should.equal(userId);
                (alerts[0].name).should.match('Alert name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Alert if not logged in', function (done) {
    agent.post('/api/alerts')
      .send(alert)
      .expect(403)
      .end(function (alertSaveErr, alertSaveRes) {
        // Call the assertion callback
        done(alertSaveErr);
      });
  });

  it('should not be able to save an Alert if no name is provided', function (done) {
    // Invalidate name field
    alert.name = '';

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

        // Save a new Alert
        agent.post('/api/alerts')
          .send(alert)
          .expect(400)
          .end(function (alertSaveErr, alertSaveRes) {
            // Set message assertion
            (alertSaveRes.body.message).should.match('Please fill Alert name');

            // Handle Alert save error
            done(alertSaveErr);
          });
      });
  });

  it('should be able to update an Alert if signed in', function (done) {
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

        // Save a new Alert
        agent.post('/api/alerts')
          .send(alert)
          .expect(200)
          .end(function (alertSaveErr, alertSaveRes) {
            // Handle Alert save error
            if (alertSaveErr) {
              return done(alertSaveErr);
            }

            // Update Alert name
            alert.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Alert
            agent.put('/api/alerts/' + alertSaveRes.body._id)
              .send(alert)
              .expect(200)
              .end(function (alertUpdateErr, alertUpdateRes) {
                // Handle Alert update error
                if (alertUpdateErr) {
                  return done(alertUpdateErr);
                }

                // Set assertions
                (alertUpdateRes.body._id).should.equal(alertSaveRes.body._id);
                (alertUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Alerts if not signed in', function (done) {
    // Create new Alert model instance
    var alertObj = new Alert(alert);

    // Save the alert
    alertObj.save(function () {
      // Request Alerts
      request(app).get('/api/alerts')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Alert if not signed in', function (done) {
    // Create new Alert model instance
    var alertObj = new Alert(alert);

    // Save the Alert
    alertObj.save(function () {
      request(app).get('/api/alerts/' + alertObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', alert.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Alert with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/alerts/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Alert is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Alert which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Alert
    request(app).get('/api/alerts/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Alert with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Alert if signed in', function (done) {
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

        // Save a new Alert
        agent.post('/api/alerts')
          .send(alert)
          .expect(200)
          .end(function (alertSaveErr, alertSaveRes) {
            // Handle Alert save error
            if (alertSaveErr) {
              return done(alertSaveErr);
            }

            // Delete an existing Alert
            agent.delete('/api/alerts/' + alertSaveRes.body._id)
              .send(alert)
              .expect(200)
              .end(function (alertDeleteErr, alertDeleteRes) {
                // Handle alert error error
                if (alertDeleteErr) {
                  return done(alertDeleteErr);
                }

                // Set assertions
                (alertDeleteRes.body._id).should.equal(alertSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Alert if not signed in', function (done) {
    // Set Alert user
    alert.user = user;

    // Create new Alert model instance
    var alertObj = new Alert(alert);

    // Save the Alert
    alertObj.save(function () {
      // Try deleting Alert
      request(app).delete('/api/alerts/' + alertObj._id)
        .expect(403)
        .end(function (alertDeleteErr, alertDeleteRes) {
          // Set message assertion
          (alertDeleteRes.body.message).should.match('User is not authorized');

          // Handle Alert error error
          done(alertDeleteErr);
        });

    });
  });

  it('should be able to get a single Alert that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Alert
          agent.post('/api/alerts')
            .send(alert)
            .expect(200)
            .end(function (alertSaveErr, alertSaveRes) {
              // Handle Alert save error
              if (alertSaveErr) {
                return done(alertSaveErr);
              }

              // Set assertions on new Alert
              (alertSaveRes.body.name).should.equal(alert.name);
              should.exist(alertSaveRes.body.user);
              should.equal(alertSaveRes.body.user._id, orphanId);

              // force the Alert to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Alert
                    agent.get('/api/alerts/' + alertSaveRes.body._id)
                      .expect(200)
                      .end(function (alertInfoErr, alertInfoRes) {
                        // Handle Alert error
                        if (alertInfoErr) {
                          return done(alertInfoErr);
                        }

                        // Set assertions
                        (alertInfoRes.body._id).should.equal(alertSaveRes.body._id);
                        (alertInfoRes.body.name).should.equal(alert.name);
                        should.equal(alertInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Alert.remove().exec(done);
    });
  });
});*/
