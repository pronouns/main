'use strict';

/**
 * Module dependencies.
 */
var pronounsPolicy = require('../policies/pronouns.server.policy'),
  pronouns = require('../controllers/pronouns.server.controller');

module.exports = function (app) {
  // Pronouns collection routes
  app.route('/api/pronouns').all(pronounsPolicy.isAllowed)
    .get(pronouns.list)
    .post(pronouns.create);

  app.route('/api/pronouns/mine').all(pronounsPolicy.isAllowed)
    .get(pronouns.listMine);

  // Single pronoun routes
  app.route('/api/pronouns/:pronounId').all(pronounsPolicy.isAllowed)
    .get(pronouns.read)
    .put(pronouns.update)
    .delete(pronouns.delete);

  app.route('/:subject/:object/:determiner/:possessive/:reflexive').all(pronouns.findByPattern);


  // Finish by binding the pronoun middleware
  app.param('pronounId', pronouns.pronounByID);
};
