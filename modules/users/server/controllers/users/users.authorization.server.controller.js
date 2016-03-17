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
  }).exec(function (err, user) {
    req.profile = user;
    next();
  });
};
exports.userByUsername = function(req, res, next, username) {
  User.findOne({
    username: username
  }).exec(function(err, user) {
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
  }).exec(function (err, user) {
    if (err) {
      if (mongoose.Types.ObjectId.isValid(usernameOrId)) {
        User.findOne({
          _id: usernameOrId
        }).exec(function (err, user) {
          if (err) {
            return next(err);
          }
          if (!!user) {
            req.profile = user;
          }
          next();
        });
      }
      else {
        return next(err);
      }
    }
    if (!!user) {
      req.profile = user;
    }
    next();
  });
};
