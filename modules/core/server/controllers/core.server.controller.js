'use strict';

var path = require('path'),
  config = require(path.resolve('./config/config'));

/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {
  res.render('modules/core/server/views/index', {
    user: JSON.stringify(req.user || null),
    sharedConfig: JSON.stringify(config.shared)

  });
};

/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
  res.status(500).render('modules/core/server/views/500', {
    error: 'Oops! Something went wrong...'
  });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {

  res.status(404).format({
    'text/html': function () {
      res.render('modules/core/server/views/404', {
        url: req.originalUrl
      });
    },
    'application/json': function () {
      res.json({
        error: 'Path not found'
      });
    },
    'default': function () {
      res.send('Path not found');
    }
  });
};
