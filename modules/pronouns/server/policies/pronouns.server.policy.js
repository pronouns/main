'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Pronouns Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/pronouns',
      permissions: '*'
    }, {
      resources: '/api/pronouns/:pronounId',
      permissions: '*'
    }, {
      resources: '/api/pronouns/mine',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/pronouns',
      permissions: ['get', 'post']
    }, {
      resources: '/api/pronouns/:pronounId',
      permissions: ['get']
    }, {
      resources: '/api/pronouns/mine',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/pronouns',
      permissions: ['get']
    }, {
      resources: '/api/pronouns/:pronounId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Pronouns Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an pronoun is being processed and the current user created it then allow any manipulation, as long as the pronoun isn't a "listed" pronoun
  if (req.pronoun && req.user && req.pronoun.user.id === req.user.id && !req.pronoun.listed) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred.
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
