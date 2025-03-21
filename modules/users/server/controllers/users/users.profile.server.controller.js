'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  async = require('async'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  request = require('request'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User'),
  PushBullet = require('pushbullet'),
  nodemailer = require('nodemailer'),
  sgTransport = require('nodemailer-sendgrid-transport'),
  suggestedStore = {};

var smtpTransport = nodemailer.createTransport(sgTransport(config.mailer.options));

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;
  delete req.body._id;

  if (user) {
    if(req.body.pronouns !== user.pronouns || req.body.names.toString() !== user.names.toString() || req.body.nouns.toString() !== user.nouns.toString() || req.body.nouns.goodWords.toString() !== user.nouns.goodWords.toString() || req.body.nouns.badWords.toString() !== user.nouns.badWords.toString()){
      req.body.canSendAlert = true;
      if(Date.now() - user.lastPronounUpdateAt > user.pronounTimeBest){
        req.body.pronounTimeBest = Date.now() - user.lastPronounUpdateAt;
      }
      req.body.lastPronounUpdateAt = Date.now();
    }

    if(req.body.email === '' && !user.email && user.provider !== 'local'){ // prevent email from being saved, fix for twitter
      delete req.body.email;
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

    user.save().then(function (user) {
      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }).catch(function (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      })
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
    User.populate(req.profile, { path: 'pronouns' }).then(function (user) {
      User.populate(user, { path: 'following', select: 'username displayName' }).then(function ( user) {
        //TODO remove non-public data !!!
        // But like I already did that, sooooooooooo...
        // Just going to have this chain of comments
        // > Br
        user.email = undefined;
        user.salt = undefined;
        user.password = undefined;
        user.resetPasswordToken = undefined;
        user.pushbulletKey = undefined;
        user.additionalProvidersData = undefined;
        user.featureToggles = undefined;
        user.fontSize = undefined;
        user.providerData = undefined;

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
    User.find({ following: req.profile._id }).select('displayName username').then(function (docs) {
      res.json(docs);
    }).catch(function (err) {
      res.json([]);
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
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).imageFileFilter;

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

        user.save().then(function () {
          req.login(user, function (err) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.json(user);
            }
          });
        }).catch(function (saveError) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(saveError)
          });
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
  User.find({ $text : { $search : req.params.searchData } }).select('username displayName names').then(function(results) {
    res.json(results);
  }).catch(function (err){
    res.json([]);
  });
};
exports.runSuggested = function(req, res){
  if(suggestedStore[req.user._id] !== undefined && suggestedStore[req.user._id].time + (1000 * 60 * 5) > Date.now()){
    console.log('1');
    for(var i = suggestedStore[req.user._id].result.length - 1; i >= 0; i--){
      if(req.user.following.indexOf(suggestedStore[req.user._id].result[i]) !== -1){
        suggestedStore[req.user._id].result.splice(i, 1);
      }
    }
    async.map(suggestedStore[req.user._id].result, function(id, done){
      User.findOne({ '_id': id }).select('username displayName names').then(function(user){
        done(err, user);
      }).catch(function (err) {
        done(err);
      });
    }, function(err, results){
      if(err){
        return res.status(400).send(err);
      }
      res.json(results);
    });
  }
  else {
    suggestedStore[req.user._id] = {
      result: [],
      time: Date.now()
    };
    var tempStore = [];
    async.each(req.user.following, function (id, done) {
      User.findOne({ '_id': id }).then(function ( user) {
        for (var i = 0; i < user.following.length; i++) {
          if (String(user.following[i]) !== String(req.user._id) && req.user.following.indexOf(user.following[i]) === -1) {
            if (tempStore[user.following[i]] === undefined) {
              tempStore[user.following[i]] = 0;
            }
            tempStore[user.following[i]]++;
          }
        }
        done();
      }).catch(function (err) {
        return done(err);
      });
    }, function (err) {
      if (err) {
        return res.status(400).send(err);
      }
      var result = Object.keys(tempStore).sort(function (a, b) {
        return tempStore[b] - tempStore[a];
      });
      if (result.length > 10) {
        result.length = 10;
      }
      suggestedStore[req.user._id].result = result;
      async.map(suggestedStore[req.user._id].result, function (id, done) {
        User.findOne({ '_id': id }).select('username displayName names').then(function (user) {
          done(null, user);
        }).catch(function (err) {
          done(err);
        });
      }, function (err, results) {
        if (err) {
          return res.status(400).send(err);
        }
        res.json(results);
      });
    });
  }

};

exports.meWithFollowing = function (req, res) {
  if(req.user !== null){
    User.findOne({ _id: req.user._id }).select('-salt -password -resetPasswordToken').populate({
      path: 'following',
      select: '-salt -password -resetPasswordToken -additionalProvidersData -providerData -pushbulletKey -email -featureToggles -fontSize',
      populate: {
        path: 'pronouns',
        model: 'Pronoun'
      }
    }).then(function (user) {
        res.json(user);
    }).catch(function () {
      res.json(null);
    });
  }
  else{
    res.json(null);
  }
};

/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
