'use strict';

/**
 * Module dependencies
 */
var alertsPolicy = require('../policies/alerts.server.policy'),
  alerts = require('../controllers/alerts.server.controller');

module.exports = function(app) {
  // Alerts Routes
  app.route('/api/alerts').all(alertsPolicy.isAllowed)
    .get(alerts.list)
    .post(alerts.create);

  app.route('/api/alerts/:alertId').all(alertsPolicy.isAllowed)
    .get(alerts.read)
    .delete(alerts.delete);

  app.route('/api/alerts/open/:alertId/:openId').all(alertsPolicy.isAllowed)
    .get(alerts.open);

  // Finish by binding the Alert middleware
  app.param('alertId', alerts.alertByID);
};
