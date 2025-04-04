'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Alert = mongoose.model('Alert'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  User = mongoose.model('User'),
  request = require('request'),
  async = require('async'),
  config = require(path.resolve('./config/config')),
  PushBullet = require('pushbullet'),
  nodemailer = require('nodemailer'),
  sgTransport = require('nodemailer-sendgrid-transport'),
  ObjectId = mongoose.Types.ObjectId,
  _ = require('lodash');

var smtpTransport = nodemailer.createTransport(sgTransport(config.mailer.options));

/**
 * Create a Alert
 */
exports.create = function (req, res) {
  var user = req.user;
  if (user) {
    if ((user.nextAlertAt === undefined || user.nextAlertAt < Date.now()) && user.canSendAlert) {
      user.nextAlertAt = Date.now() + (1000 * 60 * 10); // 10 minutes
      user.canSendAlert = false;
      user.save().then(function (user) {
        var userHasFacebook = user.additionalProvidersData && user.additionalProvidersData.facebook;
        User.find({ following: user._id }, function (err, docs) {
          console.log(docs);
          async.filter(docs, function(target, callback) {
            // !!! Removed throttling for now as a test
            // Alert.count({ 'user': user, 'targetUsers': { $elemMatch: { user: target._id } } }, function(err, c){
            //  callback(null, c === 0);
            // });
            callback(null, true);
          }, function(err, docs){
            var targets = [];
            for (var i = 0; i < docs.length; i++) {
              targets.push({
                user: docs[i]._id,
                key: new ObjectId()
              });
            }
            //CREATE ALERT
            var alert = new Alert({
              link: 'https://pronouny.xyz/users/' + user.username,
              type: 'pronoun',
              user: user,
              targetUsers: targets,
              viewedUsers: []
            });

            alert.save().then(function (alert) {
              docs.forEach(function (target) {
                // FACEBOOK
                if (target.additionalProvidersData && target.additionalProvidersData.facebook && target.alertChannels.indexOf('facebook') > -1) {
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
                      'href': alert.linkForUser(target),
                      'template': (userHasFacebook ? '@[' + user.additionalProvidersData.facebook.id + ']' : user.username) + ' has posted updated information.'
                    });
                }
                // PUSHBULLET
                if (target.alertChannels.indexOf('pushbullet') > -1 && target.pushbulletKey) {
                  var pusher = new PushBullet(target.pushbulletKey);
                  pusher.link({}, user.username + ' has posted updated information on Pronouny', 'https://pronouny.xyz/' + alert.linkForUser(target), function (error, response) {
                  });
                }

                // EMAIL
                if (target.alertChannels.indexOf('email') > -1) {
                  res.render(path.resolve('modules/alerts/server/templates/alert-email'), {
                    user: user,
                    target: target,
                    link: alert.linkForUser(target)
                  }, function (err, emailHTML) {
                    var mailOptions = {
                      to: target.email,
                      from: config.mailer.from,
                      subject: 'Pronouny alert',
                      html: emailHTML
                    };
                    smtpTransport.sendMail(mailOptions, function (err) {
                    });
                  });
                }
              });
              res.json(alert);
            }).catch(function (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            });
          });
        });
      }).catch(function (err) {
        console.error(err);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      });
    }
    else {
      res.status(400).send({
        message: 'Rate limited'
      });
    }
  }
  else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Show the current Alert
 */
exports.read = function (req, res) {

  // strip tokens to prevent spam attacks
  for(var i = 0; i < req.alert.targetUsers.length; i++){
    req.alert.targetUsers[i] = req.alert.targetUsers[i].user;
  }
  for(i = 0; i < req.alert.viewedUsers.length; i++){
    req.alert.viewedUsers[i] = req.alert.viewedUsers[i].user;
  }

  var alert = req.alert ? req.alert.toJSON() : {};

  alert.isCurrentUserOwner = !!(req.user && alert.user && alert.user._id.toString() === req.user._id.toString());

  res.jsonp(alert);
};
/**
 * Delete an Alert
 */
exports.delete = function (req, res) {
  var alert = req.alert;
  if (alert.isComplete() && String(req.user._id) === String(alert.user._id)) {
    alert.remove().then(function (err) {
      res.jsonp(alert);
    }).catch(function (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
  }
};

/**
 * List of Alerts created by a user
 */
exports.list = function (req, res) {
  Alert.find({ user: req.user._id }).sort('-created').populate('user', 'displayName username').populate('targetUsers').populate('viewedUsers').then(function (alerts) {
    res.jsonp(alerts);
  }).catch(function (err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

/**
 * List of alerts for a user
 * @param req
 * @param res
 */
exports.listAll = function(req, res){
  Alert.find({ 'targetUsers': { $elemMatch: { user: req.user._id } } }).select('user link type created targetUsers').populate('user', 'displayName username').then(function(docs){
    var result = [];
    for(var i = 0; i < docs.length; i++) {
      result[i] = docs[i].toJSON();
      for (var j = 0; j < result[i].targetUsers.length; j++){
        if(String(result[i].targetUsers[j].user) === String(req.user._id)){
          result[i].openId = result[i].targetUsers[j].key;
          console.log(result[i]);
          break;
        }
      }
      result[i].targetUsers = undefined;
    }
    res.jsonp(result);
  }).catch(function (err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.readAll = function(req, res){

};

exports.open = function (req, res) {
  var user = req.alert.markViewed(req.params.openId);
  if (user !== false) {
    req.alert.save().then(function (alert) {
      res.redirect(req.alert.link);
    }).catch(function (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
  }
  else {
    user = req.alert.checkUsedKey(req.params.openId);
    if (user !== false) {
      res.redirect(req.alert.link);
    }
    else {
      res.jsonp({ error: 'Could not find that alert.' });
    }
  }
};

/**
 * Alert middleware
 */
exports.alertByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Alert is invalid'
    });
  }

  Alert.findById(id).populate('user', 'displayName username').populate('targetUsers.user').populate('viewedUsers.user').then(function (alert) {
    if (!alert) {
      return res.status(404).send({
        message: 'No Alert with that identifier has been found'
      });
    }
    req.alert = alert;
    next();
  }).catch(function (err) {
    return next(err);
  });
};
