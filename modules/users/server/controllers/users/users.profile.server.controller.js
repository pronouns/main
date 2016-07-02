'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  request = require('request'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User'),
  PushBullet = require('pushbullet'),
  nodemailer = require('nodemailer'),
  sgTransport = require('nodemailer-sendgrid-transport');

var smtpTransport = nodemailer.createTransport(sgTransport(config.mailer.options));

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (user) {
    if(req.body.pronouns !== user.pronouns){
      req.body.canSendAlert = true;
    }
    // Merge existing user
    user = _.extend(user, req.body);
    if(user.bio && user.bio.length > 10000){
      user.bio = user.bio.substring(0, 10000);
    }
    user.pronouns = user.pronouns.filter(function (value, index, self){
      return self.indexOf(value) === index;
    });
    user.following = user.following.filter(function (value, index, self){
      return self.indexOf(value) === index && value !== user._id;
    });
    user.updated = Date.now();

    user.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};
/**
 * Return public user details
 */
exports.getUser = function (req, res) {
  if(req.profile !== null) {
    User.populate(req.profile, { path: 'pronouns' }, function (err, user) {
      User.populate(user, { path: 'following', select: 'username displayName email' }, function (err, user) {
        //TODO remove non-public data !!!
        // But like I already did that, sooooooooooo...
        // Just going to have this chain of comments
        // > Br
        user.salt = undefined;
        user.password = undefined;
        user.resetPasswordToken = undefined;
        user.pushbulletKey = undefined;
        user.additionalProvidersData = undefined;

        res.json(user);
      });
    });
  }
  else{
    res.status(400).send({
      message: 'That user doesn\'t exist'
    });
  }
};
exports.getFollowers = function (req, res){
  if(req.profile !== null) {
    User.find({ following: req.profile._id }).select('displayName email username').exec(function (err, docs) {
      if(err){
        res.json([]);
      }
      else {
        res.json(docs);
      }
    });
  }
  else{
    res.status(400).send({
      message: 'That user doesn\'t exist'
    });
  }
};
/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  var user = req.user;
  var message = null;
  var upload = multer(config.uploads.profileUpload).single('newProfilePicture');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;
  
  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;

  if (user) {
    upload(req, res, function (uploadError) {
      if(uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading profile picture'
        });
      } else {
        user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

        user.save(function (saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};
exports.runSearch = function(req, res){
  User.find({ $text : { $search : req.params.searchData } }).select('username displayName email').exec(function(err, results) {
    if(err){
      res.json([]);
    }
    else{
      res.json(results);
    }
  });
};
/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
