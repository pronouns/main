'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);
  app.route('/api/users/sendAlerts').get(users.sendAlerts);

  app.route('/api/users/search/:searchData').get(users.runSearch);

  app.route('/api/users/profile/id/:userIdSafe').get(users.getUser);
  app.route('/api/users/profile/username/:username').get(users.getUser);

  app.route('/api/users/profile/get/:usernameOrId').get(users.getUser);

  // Finish by binding the user middleware

  app.param('userIdSafe', users.userByIdSafe);
  app.param('username', users.userByUsername);
  app.param('usernameOrId', users.userByUsernameOrId);
};
