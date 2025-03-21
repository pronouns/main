'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

/**
 * User middleware
 */
exports.userByIdSafe = function (req, res, next, id) {
  User.findOne({
    _id: id
  }).then(function (user) {
    req.profile = user;
    next();
  });
};
exports.userByUsername = function(req, res, next, username) {
  User.findOne({
    username: username
  }).then(function(user) {
    req.profile = user;
    next();
  });
};
/**
 * @deprecated
 * @param req
 * @param res
 * @param next
 * @param usernameOrId
 */
exports.userByUsernameOrId = function(req, res, next, usernameOrId) {
  User.findOne({
    username: usernameOrId
  }).then(function (user) {
    if (!!user) {
      req.profile = user;
    }
    next();
  }).catch(function (error) {
    if (mongoose.Types.ObjectId.isValid(usernameOrId)) {
      User.findOne({
        _id: usernameOrId
      }).then(function (user) {
        if (!!user) {
          req.profile = user;
        }
        next();
      }).catch(function (error) {
        return next(error);
      });
    }
    else {
      return next(error);
    }
  });
};
