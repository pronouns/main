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
  User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);
    user.pronouns = user.pronouns.filter(function (value, index, self){
      return self.indexOf(value) === index;
    });
    user.friends = user.friends.filter(function (value, index, self){
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
exports.sendAlerts = function(req, res){
  var user = req.user;
  if(user) {
    var userHasFacebook = user.additionalProvidersData && user.additionalProvidersData.facebook;
    User.find({ friends: user._id }, function (err, docs) {
      docs.forEach(function (target) {
        if (target.additionalProvidersData && target.additionalProvidersData.facebook) {
          console.log('sending to ' + target.username);
          request
            .post('https://graph.facebook.com/' + target.additionalProvidersData.facebook.id + '/notifications')
            .on('response', function (response) {
              if (response.statusCode === 200) {
                //YAY
              }
            })
            .form({
              'access_token': config.facebook.clientID + '|' + config.facebook.clientSecret,
              'href': 'users/' + user.username,
              'template': 'Your friend ' + (userHasFacebook ? '@[' + user.additionalProvidersData.facebook.id + ']' : user.displayName) + ' has posted new pronouns.'
            });
        }
      });
      res.json(user);
    });
  }
  else{
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};
/**
 * Return public user details
 */
exports.getUser = function (req, res) {
  if(req.profile !== undefined) {
    User.populate(req.profile, { path: 'pronouns' }, function (err, user) {
      User.populate(user, { path: 'friends', select: 'username displayName' }, function (err, user) {
        //TODO remove non-public data !!!
        // But like I already did that, sooooooooooo...
        // Just going to have this chain of comments
        // > Br
        user.salt = undefined;
        user.password = undefined;
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

/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
