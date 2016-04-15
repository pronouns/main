'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Alerts Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/alerts',
      permissions: '*'
    }, {
      resources: '/api/alerts/open',
      permissions: '*'
    }, {
      resources: '/api/alerts/:alertId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/alerts',
      permissions: ['get', 'post']
    }, {
      resources: '/api/alerts/open/:alertId/:openId',
      permissions: ['get']
    }, {
      resources: '/api/alerts/open',
      permissions: ['get', 'delete']
    }, {
      resources: '/api/alerts/:alertId',
      permissions: '*'
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/alerts/open/:alertId/:openId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Alerts Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Alert is being processed and the current user created it then allow any manipulation
  var method = req.method.toLowerCase();
  if (req.alert && req.user && req.alert.user) {
    if(req.alert.user.id === req.user.id) {
      if(method === 'get') {
        return next();
      }
      if(method === 'delete' && req.alert.isComplete()){
        return next();
      }
    }
    /*if(req.method.toLowerCase() === 'get') {
      for (var i = 0; i < req.alert.targetUsers.length; i++) {
        if (req.alert.targetUsers[i].id === req.user.id) {
          return next();
        }
      }
    }
    if(req.method.toLowerCase() === 'get') {
      for (i = 0; i < req.alert.viewedUsers.length; i++) {
        if (req.alert.viewedUsers[i].id === req.user.id) {
          return next();
        }
      }
    }*/
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
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
