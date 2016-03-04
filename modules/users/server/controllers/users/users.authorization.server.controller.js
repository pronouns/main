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
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findOne({
    _id: id
  }).exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load User ' + id));
    }

    req.profile = user;
    next();
  });
};
exports.userByUsername = function(req, res, next, username) {
  User.findOne({
    username: username
  }).exec(function(err, user) {
    if (err) return next(err);
    if (!user) return next(new Error('Failed to load User ' + username));
    req.profile = user;
    next();
  });
};
exports.userByUsernameOrId = function(req, res, next, usernameOrId) {

  if (mongoose.Types.ObjectId.isValid(usernameOrId)) {
    User.findOne({
      _id: usernameOrId
    }).exec(function (err, user) {
      if (err) {
        return next(err);
      }
      if(!!user) {
        req.profile = user;
      }
      next();
    });
  }
  else{
    User.findOne({
      username: usernameOrId
    }).exec(function(err, user) {
      if (err) {
        return next(err);
      }
      if(!!user) {
        req.profile = user;
      }
      next();
    });
  }
};
